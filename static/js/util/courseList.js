 /* global SETTINGS: false */
import moment from 'moment';
import React from 'react';
import Button from 'react-mdl/lib/Button';

import {
  STATUS_PASSED,
  STATUS_NOT_PASSED,
  STATUS_NOT_OFFERED,
  STATUS_VERIFIED_NOT_COMPLETED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_OFFERED_NOT_ENROLLED,
  DASHBOARD_COURSE_HEIGHT,
  DASHBOARD_RUN_HEIGHT
} from '../constants';

function asPercent(number) {
  if (number === undefined || number === null) {
    return "";
  }
  return `${Math.round(number * 100)}%`;
}

/**
 * Determine React elements for the UI given a course status
 * @param {object} course A course coming from the dashboard
 * @param {moment} now The current time
 * @returns {ReactElement} Some React element or string to display for course status
 */
export function makeCourseStatusDisplay(course, now = moment()) {
  let firstRun = {};
  if (course.runs.length > 0) {
    firstRun = course.runs[0];
  }

  switch (course.status) {
  case STATUS_PASSED:
    return <span className="course-list-grade">
      {asPercent(firstRun.grade)}
    </span>;

  case STATUS_VERIFIED_NOT_COMPLETED: {
    if (!firstRun.course_start_date) {
      // Invalid case, API should always send a valid course start date
      return "";
    }

    let courseStartDate = moment(firstRun.course_start_date);
    if (courseStartDate.isAfter(now, 'day')) {
      return `Course starting: ${courseStartDate.format("M/D/Y")}`;
    }

    let grade = firstRun.grade;
    if (grade === undefined || grade === null) {
      // Grade defaults to 0%
      grade = 0;
    }
    return <span className="course-list-grade">
      {asPercent(grade)}
    </span>;
  }
  case STATUS_ENROLLED_NOT_VERIFIED: {
    if (!firstRun.verification_date) {
      // Invalid case, API should always send a valid verification date
      return "";
    }

    let courseUpgradeUrl = `${SETTINGS.edx_base_url}/course_modes/choose/${firstRun.course_id}/`;

    let verificationDate = moment(firstRun.verification_date);
    if (verificationDate.isAfter(now, 'day')) {
      return <Button bsStyle="success" href={courseUpgradeUrl} target="_blank">UPGRADE TO VERIFIED</Button>;
    } else {
      // User cannot verify anymore
      return "";
    }
  }
  case STATUS_OFFERED_NOT_ENROLLED: {
    if (!firstRun.enrollment_start_date) {
      return firstRun.fuzzy_enrollment_start_date;
    }

    let enrollmentDate = moment(firstRun.enrollment_start_date);
    if (enrollmentDate.isAfter(now, 'day')) {
      return `Enrollment starting: ${enrollmentDate.format("M/D/Y")}`;
    } else {
      if (firstRun.course_id) {
        let courseInfoUrl = `${SETTINGS.edx_base_url}/courses/${firstRun.course_id}/about`;
        return <Button bsStyle="success" href={courseInfoUrl} target="_blank">ENROLL</Button>;
      } else {
        return "";
      }
    }
  }
  default:
    // also covers NOT_OFFERED case
    return "";
  }
}

/**
 * Display status for a course run
 * @param run {Object} A course run
 * @returns {ReactElement}
 */
export function makeRunStatusDisplay(run) {
  switch (run.status) {
  case STATUS_PASSED:
    return "Passed";
  case STATUS_NOT_PASSED:
    return "Not passed";
  default:
    return "";
  }
}

/**
 * Determine progress React element for the UI given a course
 * @param {object} course A course coming from the dashboard
 * @param {bool} isFirst If false, draw a line up to the previous course
 * @param {bool} isLast If false, draw a line down to the next course
 * @param {Number} numRuns The number of course runs to draw a line past
 * @returns {ReactElement} Some React element or string to display for course status
 */
export function makeCourseProgressDisplay(course, isFirst, isLast, numRuns) {
  let outerRadius = 10, innerRadius = 8, width = 30;
  let totalHeight = DASHBOARD_COURSE_HEIGHT + numRuns * DASHBOARD_RUN_HEIGHT;
  let centerX = width/2, centerY = DASHBOARD_COURSE_HEIGHT/2;
  const blue = "#7fbaec";
  const red = "#dc1c2e";

  let topLine;
  if (!isFirst) {
    topLine = <line
      className="top-line"
      x1={centerX}
      x2={centerX}
      y1={0}
      y2={centerY - outerRadius}
      stroke={blue}
      strokeWidth={1}
    />;
  }
  let bottomLine;
  if (!isLast) {
    bottomLine = <line
      className="bottom-line"
      x1={centerX}
      x2={centerX}
      y1={centerY + outerRadius}
      y2={totalHeight}
      stroke={blue}
      strokeWidth={1}
    />;
  }

  let alt = "Course not started";
  let circleColor = blue; // light blue
  let innerElement;
  if (course.status === STATUS_PASSED) {
    // full circle to indicate course passed
    alt = "Course passed";
    innerElement = <circle cx={centerX} cy={centerY} r={innerRadius} fill={blue} />;
  } else if (course.status === STATUS_VERIFIED_NOT_COMPLETED) {
    alt = "Course started";
    // semi circle on the left side
    // see path docs: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Arcs
    let path = [
      "M", centerX, centerY - innerRadius,
      "A", innerRadius, innerRadius, 0, 0, 0, centerX, centerY + innerRadius
    ].join(" ");
    innerElement = <path
      d={path}
      fill={blue}
    />;
  } else if (course.status === STATUS_NOT_OFFERED) {
    // A course is failed if the first run is NOT_PASSED
    if (course.runs.length > 0 && course.runs[0].status === STATUS_NOT_PASSED) {
      circleColor = red;
    }
  }

  return <svg style={{width: width, height: totalHeight}}>
    <desc>{alt}</desc>
    <circle cx={centerX} cy={centerY} r={outerRadius} stroke={circleColor} fillOpacity={0} />
    {innerElement}
    {topLine}
    {bottomLine}
  </svg>;
}