/*******************************************************
Copyright (C) - DREVER International

This file is part of Malis 3 project.

Malis 3 source code can not be copied and/or distributed without the express permission of DREVER International
*******************************************************/

import { makeStyles } from '@mui/styles'
import { grey } from '@mui/material/colors'

export default makeStyles((theme) => ({
  appTextField__generateIcon: {
    color: theme.palette?.common.white,
    backgroundColor: grey[600],
    cursor: 'pointer',
    width: '20px !important',
    height: '23px !important',
    borderBottomRightRadius: theme.shape?.borderRadius,
    borderTopRightRadius: theme.shape?.borderRadius
  },
  appTextField__generateIcon__disabled: {
    opacity: 0.3
  }
}))
