import React, { Fragment } from "react";
import PropTypes from "prop-types";
// import { connect } from "react-redux";
import { Moment } from "react-moment";

const Education = ({ education }) => {
  const educations = education.map(edu => (
    <tr key={edu._id}>
      <td>{edu}</td>
      <td className="hide-sm">{edu.school}</td>

      <td className="hide-sm">
        <Moment format="YYYY/MM/DD">{edu.degree} </Moment> -
        {edu.to == null ? (
          "Present"
        ) : (
          <Moment format="YYYY/MM/DD">{edu.to} </Moment>
        )}
      </td>
      <td>
        <button className="btn btn-danger">Delete</button>
      </td>
    </tr>
  ));

  return (
    <Fragment>
      <h2 className="my-2">Education Credentials</h2>
      <table className="table">
        <thead>
          <tr>
            <th>School</th>
            <th className="hide-sm">Degree</th>
            <th className="hide-sm">Years</th>
            <th />
          </tr>
        </thead>
        <tbody> {educations} </tbody>
      </table>

      <div className="my-2">
        <button className="btn btn-danger">
          <i className="fas fa-user-minus" />
          Delete My Account
        </button>
      </div>
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired
};

export default Education;
