import React, { Fragment } from "react";
import spinner from "./spinner.gif";

export default () => (
  <Fragment>
    <img
      src={spinner}
      alt="loading"
      style={{ width: 200, margin: "auto", display: "block" }}
    />
  </Fragment>
);
