import { model, Schema } from "mongoose";
import { PasswordManager } from "../utils/utils";

export enum UserType {
    NORMAL = "normal",
    ADMIN = "admin",
}

export interface IUser {
    phone: string,
    password: string,
    username?: string,
    email?: string,
    userType?: string,
    isActive: boolean,
}

const userSchema = new Schema<IUser>({
    phone: { type: Schema.Types.String, default: "" },
    email: { type: Schema.Types.String, default: "" },
    username: { type: Schema.Types.String, default: "" },
    password: { type: Schema.Types.String, default: "" },
    userType: { type: Schema.Types.String, default: UserType.NORMAL },
    isActive: { type: Schema.Types.Boolean, default: true }
},
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    },
)

export const User = model<IUser>("User", userSchema);
