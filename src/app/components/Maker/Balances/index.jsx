import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Row, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import MakerLayout from 'Components/Maker/Layout'
import BalancesTable from 'Components/Maker/BalanceTable'


const MakerBalances = ({ isDropdownOpen, toggleDropdownOpen }) => {
  return (
    <MakerLayout className='pt-4'>
      <BalancesTable />
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('MakerBalances'),
)(MakerBalances)
