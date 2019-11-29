const React = require('react');
const pt = require('prop-types');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function imgUrl(img) {
    return `${siteConfig.baseUrl}img/${img}`;
}

function docUrl(doc, language) {
    return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}

class Button extends React.Component {
    render() {
        return (
            <div className='pluginWrapper buttonWrapper'>
                <a
                    className='button'
                    href={this.props.href}
                    target={this.props.target}
                >
                    {this.props.children}
                </a>
            </div>
        );
    }
}

Button.defaultProps = {
    target: '_self'
};

Button.propTypes = {
    children: pt.node,
    href: pt.string,
    target: pt.string
};

const SplashContainer = props => (
    <div className='homeContainer'>
        <div className='homeSplashFade'>
            <div className='wrapper homeWrapper'>{props.children}</div>
        </div>
    </div>
);

SplashContainer.propTypes = {
    children: pt.node
};

const Logo = props => (
    <div className='projectLogo' style={{ padding: '2em 86px 4em' }}>
        <img src={props.img_src} />
    </div>
);

Logo.propTypes = {
    img_src: pt.string
};

const ProjectTitle = props => (
    <h2 className='projectTitle'>
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
    </h2>
);

const PromoSection = props => (
    <div className='section promoSection'>
        <div className='promoRow'>
            <div className='pluginRowBlock'>{props.children}</div>
        </div>
    </div>
);

PromoSection.propTypes = {
    children: pt.node
};

class HomeSplash extends React.Component {
    render() {
        return (
            <SplashContainer>
                <Logo img_src={imgUrl('logo-tinkoff.svg')} />
                <div className='inner'>
                    <ProjectTitle />
                    <PromoSection>
                        <Button href={docUrl('how-to/index')}>
                            How to
                        </Button>
                        <Button href={docUrl('plugins/index')}>
                            Plugins
                        </Button>
                        <Button href={docUrl('core/index')}>
                            Internals
                        </Button>
                    </PromoSection>
                </div>
            </SplashContainer>
        );
    }
}

const TldrSection = props => (
    <div className='tldrSection productShowcaseSection lightBackground'>
        <Container>
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row wrap',
                    justifyContent: 'space-evenly'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2>Why @tinkoff/request?</h2>
                    <ul style={{ flex: '1' }}>
                        <li>Lightweight</li>
                        <li>Plugins</li>
                        <li>Customizable</li>
                        <li>Typescript</li>
                    </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2>Based on</h2>
                    <ul style={{ flex: '1' }}>
                        <li>lru-cache</li>
                        <li>node-fetch</li>
                        <li>idb-keyvalue</li>
                    </ul>
                </div>
            </div>
        </Container>
    </div>
);

class Index extends React.Component {
    render() {
        return (
            <div>
                <HomeSplash />
                <div className='mainContainer'>
                    <TldrSection />
                </div>
            </div>
        );
    }
}

module.exports = Index;
