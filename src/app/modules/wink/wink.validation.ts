import { z } from 'zod';
import { checkValidID } from '../../../shared/checkValidID';


const createWinkZodSchema = z.object({
    body: z.object({
        senderId: checkValidID('Invalid sender ID'),
        receiverId: checkValidID('Invalid receiver ID'),
    }).refine((data: { senderId: string; receiverId: string }) => data.senderId !== data.receiverId, {
        message: 'Sender and receiver cannot be the same',
    }),
});

export const WinkValidations = { createWinkZodSchema };
