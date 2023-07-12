import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "customText", async: false })
export class TimeZoneValidator implements ValidatorConstraintInterface {
  validate(text: string, _args: ValidationArguments) {
    return isValidTimeZone(text);
  }

  defaultMessage(_args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "Not a valid timezone ($value)!";
  }
}

function isValidTimeZone(timeZone: string): boolean {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw new Error("Time zones are not available in this environment");
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch (ex) {
    return false;
  }
}
