import React from 'react'
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { Button } from 'reactstrap'

import CommStatus from './CommStatus'
import ConnectionInstructions from './ConnectionInstructions'
import ConfirmAccountSelection from './ConfirmAccountSelection'
import AccountSelect from './AccountSelect'

const HardwareWalletModalView = ({
  isOpen, toggle, type, name, commStatus,
  showAccountSelect, onConfirm, disableConfirm, toggleAccountSelect,
  commStatusProps, accountSelectProps, confirmAccountSelectionProps
}) => (
  <Modal size='md' className='text-center' backdrop='static' isOpen={isOpen} toggle={toggle}>
    <ModalHeader tag='h3' className='text-primary' toggle={toggle}>
      Adding {name}
    </ModalHeader>
    <ModalBody className='flex-col-center'>
      <CommStatus className='mb-3' {...commStatusProps}/>
      {(commStatus !== 'connected'
        ? (<ConnectionInstructions type={type}/>)
        : (showAccountSelect
          ? (<AccountSelect {...accountSelectProps} />)
          : (<ConfirmAccountSelection {...confirmAccountSelectionProps}/>)))
      }
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      {showAccountSelect
        ? (<Button outline color='primary' onClick={toggleAccountSelect}>back</Button>)
        : (<Button outline color='primary' onClick={toggle}>cancel</Button>)}
      {commStatus === 'connected' && !showAccountSelect && (
        <Button color='success' onClick={onConfirm} disabled={disableConfirm}>Confirm</Button>
      )}
    </ModalFooter>
  </Modal>
)

export default HardwareWalletModalView
