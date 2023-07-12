import { Schema, Model, Document } from "mongoose";
import { MongoDbConnections } from "../MongoDbConnections";
import { CollectionNames } from "../CollectionNames";
import { MongoTimestampI, MongoUtils } from "../MongoUtils";

export interface IXXXXXEntity extends Document, MongoTimestampI {
  /*INTERFACE_FIELDS*/
}

export const XXXXXSchema: Schema = new Schema<IXXXXXEntity>(
  {
    /*SCHEMA_FIELDS*/
  },
  {
    timestamps: true,
    strict: true,
  },
);

MongoUtils.runValidatorForSchema(XXXXXSchema);

let model: Model<IXXXXXEntity> | undefined;

export const XXXXXModel = (): Model<IXXXXXEntity> => {
  if (!model) {
    model = MongoDbConnections.QodehiveApps.getConnection().model(
      CollectionNames.XXXXXCollection,
      XXXXXSchema,
    );
  }

  return model;
};
