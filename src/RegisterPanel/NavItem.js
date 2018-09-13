import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RegisterSelector from './RegisterSelector';

class NavItem extends Component {
  constructor(props) {
    super(props);
    this.handleBtnClick = this.handleBtnClick.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.state = {
      isSelected: false,
      selectedRegisters: {},
    };
  }

  handleBtnClick() {
    const { handleRegisterAdminBtnClick, filename } = this.props;
    this.setState(prevState => ({ isSelected: !prevState.isSelected }));
    handleRegisterAdminBtnClick(filename);
  }

  handleCheckboxChange(event) {
    const { filename, handleRegisterSelection } = this.props;
    const { selectedRegisters } = { ...this.state };
    const registerName = event.target.id;
    const isSelected = event.target.checked;
    selectedRegisters[registerName] = isSelected;
    this.setState({ selectedRegisters });
    handleRegisterSelection(filename, registerName);
  }

  render() {
    const { isSelected } = this.state;
    const { filter } = this.props;
    const btnClass = isSelected ? 'btn btn--selected' : 'btn';

    return (
      <li className="nav__item">
        <button type="button" id={filter.name} className={btnClass} onClick={this.handleBtnClick}>
          {filter.name}
        </button>
        <RegisterSelector
          show={isSelected}
          registerAdminName={filter.name}
          registerFilter={filter.registers}
          handleCheckboxChange={this.handleCheckboxChange}
        />
      </li>
    );
  }
}

NavItem.propTypes = {
  filename: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  handleRegisterAdminBtnClick: PropTypes.func.isRequired,
  handleRegisterSelection: PropTypes.func.isRequired,
};

export default NavItem;
