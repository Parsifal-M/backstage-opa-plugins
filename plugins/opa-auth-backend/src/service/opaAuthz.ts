import { Request, Response } from 'express';
import { OpaClient } from "../opa/opaClient";

export async function opaAuthz(req: Request, res: Response) {
  // Extract input data from the request
  const { body } = req;
  const input = body.input;

  // Evaluate the policy
  const client = new OpaClient('http://localhost:8181/v1/data'); // Replace with your OPA URL
  const decision = await client.evaluatePolicy(input);


  console.log(`Input: ${JSON.stringify(input)}`);
  console.log(`Decision: ${decision}`);


  if (decision) {
    // Allow the request
    console.log("Allowing request")
    return res.status(200).send();
  } 
    // Deny the request
    console.log("Denying request")
    return res.status(403).send();
  
}
