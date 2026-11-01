import { useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'

const steps = [
    { key: 'shipping', label: 'Shipping', path: '/shipping' },
    { key: 'confirmOrder', label: 'Confirm Order', path: '/confirm' },
    { key: 'payment', label: 'Payment', path: '/payment' },
]

const CheckoutSteps = (props) => {
    const navigate = useNavigate()
    const activeStep = steps.filter(step => props[step.key]).length - 1

    return (
        <Paper sx={{ mt: { xs: 3, md: 5 }, py: 2.5, px: { xs: 1, sm: 3 } }}>
            <Stepper nonLinear alternativeLabel activeStep={activeStep} aria-label="Checkout progress">
                {steps.map((step, index) => (
                    <Step key={step.key} completed={index < activeStep}>
                        <StepButton disabled={!props[step.key]} onClick={() => navigate(step.path)}>
                            {step.label}
                        </StepButton>
                    </Step>
                ))}
            </Stepper>
        </Paper>
    )
}

export default CheckoutSteps
