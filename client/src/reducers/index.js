import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import profile from "./profile";
//take any object we want to create additional reducers
export default combineReducers({ alert, auth, profile });
