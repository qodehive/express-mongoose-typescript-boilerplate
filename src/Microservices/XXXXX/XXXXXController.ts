/* eslint-disable indent */
import { HttpStatusCodes } from "../../CommonConstants";
import { ApiResponseI } from "../../CommonHttpServer/ResponseHandler";
import { Logger } from "../../Utils/Logger";
import {
  XXXXXI,
  CreateXXXXXDto,
  DeleteXXXXXDto,
  UpdateXXXXXDto,
  DeleteManyXXXXXDto,
} from "./XXXXX.dto";
import { XXXXXModel, IXXXXXEntity } from "../../Database/Entities/XXXXXEntity";

const tag = "XXXXXController";

export const XXXXXController = {
  async index(): Promise<ApiResponseI> {
    try {
      const entityList = await XXXXXModel().find().sort({ orderNo: 1 });

      const data: XXXXXI[] = entityList.map((entity) => this.getEntityResponseDto(entity));

      return {
        status: HttpStatusCodes.OK,
        message: "Entity List",
        data,
      };
    } catch (error) {
      Logger.warn({ message: "Entity List", error, tag });
      throw error;
    }
  },

  async create(input: CreateXXXXXDto): Promise<ApiResponseI> {
    try {
      /*CHECK_EXISTING_CREATE_ENTITY*/

      const newEntity = new (XXXXXModel())({ ...input });

      await newEntity.save();

      return {
        status: HttpStatusCodes.OK,
        message: "Entity Created successfully",
      };
    } catch (error) {
      Logger.warn({ message: "Create Entity", error, tag });
      throw error;
    }
  },

  async update(input: UpdateXXXXXDto): Promise<ApiResponseI> {
    try {
      const { id /*UNIQUE_FIELDS*/ } = input;

      const entity = await XXXXXModel().findById(id);

      if (!entity) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          message: "No Such Entity Found",
        };
      }

      /*CHECK_EXISTING_UPDATE_ENTITY*/

      const updatedEntity = await XXXXXModel().findOneAndUpdate(
        { _id: id },
        { ...this.getEntityWithoutId(input as any) },
      );

      if (!updatedEntity) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          message: "Not Found",
        };
      }

      const data: XXXXXI = this.getEntityResponseDto(updatedEntity);

      Logger.info({
        message: "Entity Updated Successfully",
        data,
        tag,
      });

      return {
        status: HttpStatusCodes.OK,
        message: "entity Updated",
      };
    } catch (error) {
      Logger.warn({ message: "Entity update Failed", error, tag });
      throw error;
    }
  },

  async destroyMany(input: DeleteManyXXXXXDto): Promise<ApiResponseI> {
    try {
      const { ids } = input;

      const mapping = await XXXXXModel().deleteMany({
        _id: { $in: ids },
      });

      if (!mapping || mapping.deletedCount === 0) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          message: "This entity doesn't exist",
        };
      }

      Logger.info({ message: `${mapping.deletedCount} entities Deleted`, data: { ids }, tag });
      return {
        status: HttpStatusCodes.OK,
        message: "Entity Deleted",
      };
    } catch (error) {
      Logger.warn({ message: "DeleteEntity Failed", error, tag });
      throw error;
    }
  },

  async destroy(input: DeleteXXXXXDto): Promise<ApiResponseI> {
    try {
      const { id } = input;

      const mapping = await XXXXXModel().findOneAndDelete({
        _id: id,
      });

      if (!mapping) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          message: "This entity doesn't exist",
        };
      }

      Logger.info({ message: "Entity Deleted", data: { id }, tag });
      return {
        status: HttpStatusCodes.OK,
        message: "Entity Deleted",
      };
    } catch (error) {
      Logger.warn({ message: "DeleteEntity Failed", error, tag });
      throw error;
    }
  },

  async getEntityById(entityId: string): Promise<ApiResponseI> {
    const entity = await XXXXXModel().findOne({ _id: entityId });

    if (!entity) {
      return {
        status: HttpStatusCodes.NOT_FOUND,
        message: "Not Found",
      };
    }

    const data: XXXXXI = this.getEntityResponseDto(entity);

    return {
      status: HttpStatusCodes.OK,
      message: "Entity Data",
      data,
    };
  },

  getEntityResponseDto(entity: IXXXXXEntity): XXXXXI {
    return {
      id: entity?._id?.toString?.(),
      /*ENTITY_FIELDS*/
    };
  },

  getEntityWithoutId(entity: IXXXXXEntity): CreateXXXXXDto {
    const data = this.getEntityResponseDto(entity);
    const { id, ...rest } = data;
    return rest;
  },
};
