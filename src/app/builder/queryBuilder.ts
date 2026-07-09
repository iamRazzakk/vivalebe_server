import { FilterQuery, Query, Types } from 'mongoose';
import ApiError from '../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';

type SortOrder = 1 | -1;

type ParsedSort = {
    field: string;
    order: SortOrder;
};

type CursorPayload = {
    sortField: string;
    sortValue: string;
    id: string;
    pointer?: 'next' | 'prev';
};

export type CursorPaginationMeta = {
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    private cursorLimit = DEFAULT_LIMIT;
    private cursorDirection: 'next' | 'prev' = 'next';
    private parsedSort: ParsedSort = { field: 'createdAt', order: -1 };
    private hasCursor = false;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    //searching
    search(searchableFields: string[]) {
        if (this?.query?.searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    field =>
                    ({
                        [field]: {
                            $regex: this.query.searchTerm,
                            $options: 'i',
                        },
                    } as FilterQuery<T>)
                ),
            });
        }
        return this;
    }

    //filtering
    filter() {
        const queryObj = { ...this.query };
        const excludeFields = [
            'searchTerm',
            'sort',
            'page',
            'limit',
            'fields',
            'cursor',
            'nextCursor',
            'prevCursor',
            'previousCursor',
            'direction',
        ];
        excludeFields.forEach(el => delete queryObj[el]);

        // Handle price range specially
        if (queryObj['price']) {
            const priceObj = queryObj['price'] as { min?: number; max?: number };
            const priceFilter: Record<string, unknown> = {};

            if (priceObj.min !== undefined) {
                priceFilter.$gte = priceObj.min;
            }
            if (priceObj.max !== undefined) {
                priceFilter.$lte = priceObj.max;
            }

            this.modelQuery = this.modelQuery.find({
                ...queryObj,
            });

            delete queryObj['price'];
        } else {
            this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
        }

        return this;
    }

    //sorting
    sort() {
        const sort = (this?.query?.sort as string) || '-createdAt';
        this.parsedSort = this.parseSort(sort);
        this.modelQuery = this.modelQuery.sort(this.getCompoundSort(this.parsedSort.order));

        return this;
    }

    // offset pagination
    paginate() {
        const limit = Number(this?.query?.limit) || DEFAULT_LIMIT;
        const page = Number(this?.query?.page) || 1;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }

    // cursor pagination
    cursorPaginate() {
        const rawLimit = Number(this.query.limit);
        this.cursorLimit = Number.isFinite(rawLimit)
            ? Math.min(Math.max(1, rawLimit), MAX_LIMIT)
            : DEFAULT_LIMIT;

        const previousCursor =
            (this.query.previousCursor as string | undefined) ??
            (this.query.prevCursor as string | undefined);
        const nextCursor = this.query.nextCursor as string | undefined;
        const genericCursor = this.query.cursor as string | undefined;
        const cursorFromQuery = previousCursor ?? nextCursor ?? genericCursor;

        let inferredDirection: 'next' | 'prev' = previousCursor ? 'prev' : 'next';
        if (!this.query.direction && !previousCursor && !nextCursor && genericCursor) {
            const decodedForDirection = this.decodeCursor(genericCursor);
            inferredDirection = decodedForDirection.pointer === 'prev' ? 'prev' : 'next';
        }

        const direction = String(this.query.direction ?? inferredDirection).toLowerCase();
        this.cursorDirection = direction === 'prev' ? 'prev' : 'next';

        if (!this.parsedSort.field) {
            this.parsedSort = this.parseSort((this.query.sort as string) || '-createdAt');
        }

        const effectiveOrder = this.getEffectiveSortOrder();
        const cursor = cursorFromQuery;

        if (cursor) {
            this.hasCursor = true;
            const decoded = this.decodeCursor(cursor);
            this.validateCursor(decoded);
            this.modelQuery = this.modelQuery.find(
                this.buildCursorFilter(decoded, effectiveOrder)
            );
        }

        this.modelQuery = this.modelQuery
            .sort(this.getCompoundSort(effectiveOrder))
            .limit(this.cursorLimit + 1);

        return this;
    }

    getCursorPaginationMeta<K extends Record<string, unknown>>(results: K[]) {
        let items = [...results];
        const hasExtra = items.length > this.cursorLimit;
        if (hasExtra) {
            items = items.slice(0, this.cursorLimit);
        }
        if (this.cursorDirection === 'prev') {
            items = items.reverse();
        }

        const hasNextPage =
            this.cursorDirection === 'prev' ? this.hasCursor : hasExtra;
        const hasPreviousPage =
            this.cursorDirection === 'prev' ? hasExtra : this.hasCursor;

        const nextCursor =
            hasNextPage && items.length > 0
                ? this.encodeCursor(items[items.length - 1], 'next')
                : null;
        const prevCursor =
            hasPreviousPage && items.length > 0
                ? this.encodeCursor(items[0], 'prev')
                : null;

        return {
            data: items,
            meta: {
                limit: this.cursorLimit,
                hasNextPage,
                hasPreviousPage,
                nextCursor,
                prevCursor,
            } satisfies CursorPaginationMeta,
        };
    }

    //fields filtering
    fields() {
        const fields =
            (this?.query?.fields as string)?.split(',').join(' ') || '-__v';
        this.modelQuery = this.modelQuery.select(fields);

        return this;
    }

    //populating
    populate(populateFields: string[], selectFields: Record<string, unknown>) {
        this.modelQuery = this.modelQuery.populate(
            populateFields.map(field => ({
                path: field,
                select: selectFields[field],
            }))
        );
        return this;
    }

    // offset pagination information
    async getPaginationInfo() {
        const total = await this.modelQuery.model.countDocuments(
            this.modelQuery.getFilter()
        );
        const limit = Number(this?.query?.limit) || DEFAULT_LIMIT;
        const page = Number(this?.query?.page) || 1;
        const totalPage = Math.ceil(total / limit);

        return {
            total,
            limit,
            page,
            totalPage,
        };
    }

    private parseSort(sort: string): ParsedSort {
        const trimmed = sort.trim();
        const order: SortOrder = trimmed.startsWith('-') ? -1 : 1;
        const field = trimmed.replace(/^-/, '');

        if (!field) {
            return { field: 'createdAt', order: -1 };
        }

        return { field, order };
    }

    private getEffectiveSortOrder(): SortOrder {
        return (
            this.cursorDirection === 'prev'
                ? (-this.parsedSort.order as SortOrder)
                : this.parsedSort.order
        );
    }

    private getCompoundSort(order: SortOrder) {
        return {
            [this.parsedSort.field]: order,
            _id: order,
        };
    }

    private encodeCursor(
        doc: Record<string, unknown>,
        pointer: 'next' | 'prev'
    ): string {
        const sortValue = doc[this.parsedSort.field];
        let serialized: string;

        if (sortValue instanceof Date) {
            serialized = sortValue.toISOString();
        } else if (sortValue !== undefined && sortValue !== null) {
            serialized = String(sortValue);
        } else {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Unable to build pagination cursor'
            );
        }

        const payload: CursorPayload = {
            sortField: this.parsedSort.field,
            sortValue: serialized,
            id: String(doc._id),
            pointer,
        };

        return Buffer.from(JSON.stringify(payload)).toString('base64url');
    }

    private decodeCursor(cursor: string): CursorPayload {
        try {
            const decoded = JSON.parse(
                Buffer.from(cursor, 'base64url').toString('utf-8')
            ) as Partial<CursorPayload>;

            if (!decoded.sortField || !decoded.sortValue || !decoded.id) {
                throw new Error('Invalid cursor structure');
            }

            return decoded as CursorPayload;
        } catch {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid cursor');
        }
    }

    private validateCursor(payload: CursorPayload) {
        if (payload.sortField !== this.parsedSort.field) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Cursor does not match the current sort field'
            );
        }

        if (!Types.ObjectId.isValid(payload.id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid cursor');
        }
    }

    private coerceSortValue(value: string, field: string): Date | string | number {
        if (field.endsWith('At') || field.endsWith('Date')) {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
                return date;
            }
        }

        const numericValue = Number(value);
        if (value !== '' && !Number.isNaN(numericValue)) {
            return numericValue;
        }

        return value;
    }

    private buildCursorFilter(
        payload: CursorPayload,
        effectiveOrder: SortOrder
    ): FilterQuery<T> {
        const sortValue = this.coerceSortValue(
            payload.sortValue,
            payload.sortField
        );
        const id = new Types.ObjectId(payload.id);
        const field = payload.sortField;
        const isDesc = effectiveOrder === -1;

        if (isDesc) {
            return {
                $or: [
                    { [field]: { $lt: sortValue } },
                    { [field]: sortValue, _id: { $lt: id } },
                ],
            } as FilterQuery<T>;
        }

        return {
            $or: [
                { [field]: { $gt: sortValue } },
                { [field]: sortValue, _id: { $gt: id } },
            ],
        } as FilterQuery<T>;
    }
}

export default QueryBuilder;
