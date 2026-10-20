import { Helmet } from 'react-helmet'

const MetaData = ({ title }) => {
    return (
        <Helmet>
            <title>{`${title} - RuR`}</title>
        </Helmet>
    )
}

export default MetaData
