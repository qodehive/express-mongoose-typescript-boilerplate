import { Model, Schema } from "mongoose";
import { PaginationResult } from "../CommonConstants";

export const MongoUtils = {
  runValidatorForSchema: function (schema: Schema) {
    const setRunValidators = function (this: any) {
      this.setOptions({ runValidators: true });
    };

    schema.pre("findOneAndUpdate", setRunValidators);
    schema.pre("updateMany", setRunValidators);
    schema.pre("updateOne", setRunValidators);
    schema.pre("update", setRunValidators);
  },
};

export async function getPaginationResult(data: {
  currentPage: number;
  pageSize: number;
  model: Model<any>;
  filter: any;
}): Promise<PaginationResult> {
  const { currentPage, pageSize, filter, model } = data;
  const totalRecords: number = await model.countDocuments(filter);

  return {
    totalRecords,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
}

export interface MongoTimestampI {
  createdAt: Date;
  updatedAt: Date;
}
