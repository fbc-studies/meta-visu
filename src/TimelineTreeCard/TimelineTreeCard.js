import React, { Component } from "react";
import PropTypes from "prop-types";

import CardHeader from "../CardHeader/CardHeader";
import TimelineTreeSVG from "../TimelineTreeSVG/TimelineTreeSVG";
import "../_css/card.css";
import "./TimelineTreeCard.css";

class TimelineTreeCard extends Component {
  constructor(props) {
    super(props);
    this.handleYearSelection = this.handleYearSelection.bind(this);
    this.state = {
      scaleYearsSlider: { min: 1900, max: 2018 },
      scaleYears: { min: 1900, max: 2018 }
    };
  }

  componentDidMount() {
    const { timelineConfig } = this.props;
    const startYear = timelineConfig.scaleStartDate.getFullYear();
    const currentYear = new Date().getFullYear();
    this.setState({ scaleYearsSlider: { min: startYear, max: currentYear } });
    this.setState({ scaleYears: { min: startYear, max: currentYear } });
  }

  handleYearSelection(years, mode) {
    const { scaleYearsSlider } = this.state;
    switch (mode) {
      case "change":
        this.setState({ scaleYearsSlider: { min: years.min, max: years.max } });
        break;
      case "afterChange":
        this.setState({ scaleYears: scaleYearsSlider });
        break;
      default:
        console.log("no such event mode");
    }
  }

  render() {
    const {
      lang,
      show,
      filename,
      data,
      cohortFilter,
      fileFilter,
      treeConfig,
      timelineConfig
    } = this.props;

    const { scaleYearsSlider, scaleYears } = this.state;
    const scaleStartDate = new Date(`${scaleYears.min}-01-01`);
    const scaleEndDate = new Date(`${scaleYears.max}-12-31`);
    const timelineConfigExtended = {
      ...timelineConfig,
      scaleStartDate,
      scaleEndDate
    };

    const classes = show
      ? "timeline-tree-wrapper card"
      : " timeline-tree-wrapper card card--collapsed";
    const treeFilter = fileFilter.registers;
    // NOTE: this key updates depending on the filter props to force remounting
    // the TimelineTree with updated filters
    // IDEA: proper solution probably might be to componenDidUpdate() in the svg-component?
    const svgKey =
      Object.values(treeFilter)
        .map(
          register =>
            `${register.isSelected}${Object.values(register.registerDetails)
              .map(registerDetail => registerDetail.isSelected)
              .join("")}`
        )
        .join("") +
      Object.values(cohortFilter)
        .map(cohort => cohort.isSelected)
        .join("") +
      scaleYears.min +
      scaleYears.max +
      lang;

    const renderSVG = () => {
      if (fileFilter.isSelected) {
        return (
          <TimelineTreeSVG
            lang={lang}
            data={data}
            cohortFilter={cohortFilter}
            treeFilter={treeFilter}
            treeConfig={treeConfig}
            timelineConfig={timelineConfigExtended}
            filename={filename}
            key={svgKey}
          />
        );
      }
      return null;
    };
    return (
      <div className={classes}>
        <CardHeader
          lang={lang}
          name={fileFilter.name}
          selectedYears={scaleYearsSlider}
          handleYearSelection={this.handleYearSelection}
        />
        {renderSVG()}
      </div>
    );
  }
}

TimelineTreeCard.propTypes = {
  lang: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  filename: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  fileFilter: PropTypes.object.isRequired,
  treeConfig: PropTypes.object.isRequired,
  timelineConfig: PropTypes.object.isRequired
};

export default TimelineTreeCard;
