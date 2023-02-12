// Mailerlite

// function mailerlite() {
//   const code = 'q2f6f6'
//   const action = `https://app.mailerlite.com/webforms/submit/${code}`
//   const [status, setStatus] = useState('ready')
//   const [value, setValue] = useState('')
//   const handleSubmit = (event) => {
//     event.preventDefault()
//     console.log('hi')
//     setStatus('sending')

//     fetch(action, {
//       method: 'POST',
//       mode: 'cors',
//       credentials: 'omit',
//       referrerPolicy: 'no-referrer',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: `fields[email]=${encodeURIComponent(value)}&ml-submit=1`
//     })
//       .then(() => {
//         setStatus('sent')
//       })
//       .catch((error) => {
//         console.log(error)
//         setStatus('error')
//       })
//   }

//   const classes = useStyles()

//   if (status == 'ready') {
//     return (
//       <Form
//         code={code}
//         action={action}
//         classes={classes}
//         onSubmit={handleSubmit}
//         value={value}
//         setValue={setValue}
//       />
//     )
//   }

//   if (status == 'sending') {
//     return (
//       <React.Fragment>
//         <Typography component="p" paragraph={true}>
//           Sending subscription to <a href="https://www.mailerlite.com">Mailerlite</a>.
//         </Typography>
//         <LinearProgress color="secondary" />
//       </React.Fragment>
//     )
//   }

//   if (status == 'sent') {
//     return (
//       <React.Fragment>
//         <Typography component="p" paragraph={true}>
//         Thank you for subscribing to the bulletin.
//         </Typography>
//         <LinearProgress value={100} variant="determinate" />
//       </React.Fragment>
//     )
//   }

//   if (status == 'error') {
//     return (
//       <React.Fragment>
//         <Form
//           code={code}
//           action={action}
//           classes={classes}
//           onSubmit={handleSubmit}
//           value={value}
//           setValue={setValue}
//         />
//         <SnackbarContent
//           variant="outlined"
//           className={classes.error}
//           message="Something went wrong. Try again later." />
//       </React.Fragment>
//     )
//   }
//   // <img src="https://track.mailerlite.com/webforms/o/1715020/q2f6f6?v4a60e9ef938a7fa0240ac9ba567062cb" width="1" height="1" style="max-width:1px;max-height:1px;visibility:hidden;padding:0;margin:0;display:block" alt="." border="0" />
// }
