import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { machineModel } from "../../../models/machine";
import { productModel } from "../../../models/product";
import { filterOnlyUseKeyAndValue } from "../../../utils/filterRequest";
import { logError } from "../../../utils/logger";

const editMachineHandler = async (req: Request, res: Response) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ status: "error", error: error.array() });
    }

    const machine = await machineModel.findOne({
      vendor_code: req.query.vendor_id as string,
    });

    if (!machine) {
      return res.status(404).json({ status: "not found" });
    }

    const requiredKey = ["name", "quantity"];

    const doc = filterOnlyUseKeyAndValue<{
      name: string;
      quantity: number;
    }>(req.body, requiredKey);

    await productModel.updateOne(
      { _id: req.params.product_id, machine_id: machine._id },
      { ...doc, photo: req.file ? req.file.buffer : undefined }
    );

    return res.json({ status: "ok" });
  } catch (error) {
    logError(error);

    return res.status(500).json({ status: "not ok" });
  }
};

export default editMachineHandler;
