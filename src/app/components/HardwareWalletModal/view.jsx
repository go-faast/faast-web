import React from 'react'
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { Button } from 'reactstrap'

import CommStatus from './CommStatus'
import ConnectionInstructions from './ConnectionInstructions'
import ConfirmAccountSelection from './ConfirmAccountSelection'
import AccountSelect from './AccountSelect'

const HardwareWalletModalView = ({
  type, name, isOpen, handleToggle, handleClose, commStatus,
  showAccountSelect, onConfirm, disableConfirm, toggleAccountSelect,
  commStatusProps, accountSelectProps, confirmAccountSelectionProps
}) => (
  <Modal size='lg' className='text-center' isOpen={isOpen} toggle={handleToggle}>
    <ModalHeader tag='h3' className='text-primary' cssModule={{ 'modal-title': 'modal-title mx-auto' }} toggle={handleToggle}>
      Adding {name}
    </ModalHeader>
    <ModalBody className='flex-col-center'>
      <div className='modal-text flex-col-center py-4'>
        <CommStatus className='mb-3' {...commStatusProps}/>
        {(commStatus !== 'connected'
          ? (<ConnectionInstructions type={type}/>)
          : (showAccountSelect
            ? (<AccountSelect {...accountSelectProps} />)
            : (<ConfirmAccountSelection {...confirmAccountSelectionProps}/>)))
        }
      </div>
    </ModalBody>
    <ModalFooter className='justify-content-between'>
      {showAccountSelect
        ? (<Button outline color='primary' onClick={toggleAccountSelect}>back</Button>)
        : (<Button outline color='primary' onClick={handleClose}>cancel</Button>)}
      {commStatus === 'connected' && !showAccountSelect && (
        <Button color='success' onClick={onConfirm} disabled={disableConfirm}>Confirm</Button>
      )}
    </ModalFooter>
  </Modal>
)

export default HardwareWalletModalView
