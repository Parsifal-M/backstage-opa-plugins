import { Request, Response } from 'express';
import { OpaClient } from "../opa/opaClient";

export async function opaAuthz(req: Request, res: Response): Promise<void> {
  try {
    // Extract input data from the request
    const { input } = req.body;

    // Evaluate the policy
    const client = new OpaClient('http://localhost:8181/v1/data'); // Replace with your OPA URL
    const decision = await client.evaluatePolicy(input);

    if (decision) {
      // Allow the request
      res.status(200).send();
    } else {
      // Deny the request
      res.status(403).send();
    }
  } catch (error) {
    console.error(`Error evaluating policy: ${error}`);
    res.status(500).send();
  }
}
