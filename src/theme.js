import { red } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles'

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0088FF',
      visited: '#4466AA',
    },
    secondary: {
      main: '#FF4477',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#EEEEEE',
      main: 'white'
    },
  },
  typography: {
    fontSize: 16
  },
})

export default theme
