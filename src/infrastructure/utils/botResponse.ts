export enum BotResponse {
  UserNotFound = "User not found error! Please login before request!",
  GetAlertFailed = "Failed to get alert! Please recheck alertID or relogin!",
  ListAlertsFailed = "Failed to list alerts! Please relogin!",
  RemoveAlertSuccessfully = "Success to remove alert! Please use /list or /get command to check!",
  RemoveAlertFailed = "Failed to remove alert! Please recheck alertID or relogin!",
  LoginFailed = "Failed to login! Please regenerate backup code / authentication code!",
  LoginSuccessfully = "Success to login! Now you can use Pancake!",
  CreateAlertSuccessfully = "Success to create alert! Please use /list or /get command to check!",
  CreateAlertFailed = "Failed to create alert! Please relogin!",
}
