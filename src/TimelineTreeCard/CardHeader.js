import React from 'react';
import PropTypes from 'prop-types';
import YearSlider from './YearSlider';

function CardHeader({ lang, name, yearSelected }) {
  return (
    <div className="card__header">
      <a href={`#${name[lang]}`} className="title card__title">
        {name[lang]}
      </a>
      <div className="card__year-control">
        <h3 className="year-control-title">Set years:</h3>
        <YearSlider slideStopped={yearSelected} />
      </div>
    </div>
  );
}

CardHeader.propTypes = {
  lang: PropTypes.string.isRequired,
  name: PropTypes.object.isRequired,
  yearSelected: PropTypes.func.isRequired,
};

export default CardHeader;
