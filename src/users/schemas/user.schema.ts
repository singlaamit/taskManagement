import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // 👈 Add Types

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId; // 👈 Add this line so TypeScript knows

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['USER', 'ADMIN'], default: 'USER' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
