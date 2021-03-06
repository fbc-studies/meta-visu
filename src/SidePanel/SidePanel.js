import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import RegisterAdminItem from "../RegisterAdminItem/RegisterAdminItem";
//import { compareByName } from '../_js/helpers';

import "../_css/simpleList.css";
import "../_css/card.css";
import "./SidePanel.css";
import ToggleButton from "../ToggleButton/ToggleButton";

class SidePanel extends Component {
  constructor(props) {
    super(props);
    this.toggleMinimize = this.toggleMinimize.bind(this);
    this.cohortTitle = { en: "Filter by cohorts:", fi: "Suodata kohortteja:" };
    this.keywordTitle = {
      en: "Select a keyword...",
      fi: "Valitse avainsana..."
    };
    this.registrarTitle = {
      en: "...or select a registrar:",
      fi: "...tai valitse ylläpitäjä:"
    };
    this.state = {
      isMinimized: false
    };
  }

  toggleMinimize() {
    this.setState(prevState => ({ isMinimized: !prevState.isMinimized }));
  }

  render() {
    const {
      cohortFilter,
      keywordFilter,
      treeFilter,
      toggleCohortFilter,
      toggleFileFilter,
      toggleKeywordFilter,
      toggleRegisterFilter,
      selectLang,
      lang
    } = this.props;
    const { isMinimized } = this.state;

    const classes = classNames("card", "card--strongShadow", "sidePanel", {
      "sidePanel--closed": isMinimized
    });

    const toggleBtnClasses = classNames("sidePanel__toggleControl", {
      "sidePanel__toggleControl--rotate": isMinimized
    });

    const languageSelectors = ["en", "fi"].map(langOpt => (
      <ToggleButton
        key={langOpt}
        isSelected={lang === langOpt}
        type="TEXT"
        handleClick={() => selectLang(langOpt)}
      >
        {langOpt}
      </ToggleButton>
    ));

    const cohortSelectors = Object.values(cohortFilter).map(cohort => (
      <ToggleButton
        key={cohort.name}
        isSelected={cohort.isSelected}
        type="TAG"
        handleClick={() => toggleCohortFilter(cohort.name)}
        mixClasses="sidePanel__langSelector"
      >
        {cohort.name}
      </ToggleButton>
    ));

    const langKeywords = keywordFilter[lang];
    let keywordSelectors = [];
    if (langKeywords) {
      keywordSelectors = Object.keys(langKeywords)
        .sort()
        .map(keyword => {
          const { isSelected } = langKeywords[keyword];
          return (
            <ToggleButton
              key={keyword}
              isSelected={isSelected}
              type="TAG"
              handleClick={() => toggleKeywordFilter(keyword)}
              mixClasses="sidePanel__keywordSelector"
            >
              {keyword}
            </ToggleButton>
          );
        });
    }

    const registerAdminItems = Object.keys(treeFilter)
      // .sort((a, b) => compareByName(treeFilter[a], treeFilter[b], lang, {
      //   en: 'National Institute for Health and Welfare',
      //   fi: 'THL',
      // }))
      .map(filename => {
        const fileFilter = treeFilter[filename];
        return (
          <RegisterAdminItem
            lang={lang}
            key={filename}
            filename={filename}
            fileFilter={fileFilter}
            toggleFileFilter={toggleFileFilter}
            toggleRegisterFilter={toggleRegisterFilter}
          />
        );
      });
    return (
      <aside className={classes}>
        <div className="sidePanel__controls">
          <div className="sidePanel__controlsRow">
            <div className="sidePanel__langControls">{languageSelectors}</div>
            <button
              type="button"
              className={toggleBtnClasses}
              onClick={this.toggleMinimize}
            >
              <img
                src="assets/material-arrow_back.svg"
                alt="register panel toggle"
              />
            </button>
          </div>

          <div className="">
            <h2 className="sidePanel__categoryTitle">
              {this.cohortTitle[lang]}
            </h2>
            <div>{cohortSelectors}</div>
          </div>
          <div className="sidePanel__controlsRow" />

          <div className="">
            <h2 className="sidePanel__categoryTitle">
              {this.keywordTitle[lang]}
            </h2>
            <div>{keywordSelectors}</div>
            <h2 className="sidePanel__categoryTitle sidePanel__categoryTitle--secondary">
              {this.registrarTitle[lang]}
            </h2>
          </div>
        </div>

        <ul className="simpleList sidePanel__simpleList">
          {registerAdminItems}
        </ul>
      </aside>
    );
  }
}

SidePanel.propTypes = {
  lang: PropTypes.string.isRequired,
  treeFilter: PropTypes.object.isRequired,
  toggleFileFilter: PropTypes.func.isRequired,
  toggleRegisterFilter: PropTypes.func.isRequired,
  selectLang: PropTypes.func.isRequired
};

export default SidePanel;
