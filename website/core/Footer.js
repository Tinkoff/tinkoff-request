/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const pt = require('prop-types');

class Footer extends React.Component {
    static propTypes = {
        config: pt.object
    };

    docUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;

        return `${baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
    }

    pageUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;

        return baseUrl + (language ? `${language}/` : '') + doc;
    }

    render() {
        return (
            <footer className='nav-footer' id='footer'>
                <section className='copyright'>
                    {this.props.config.copyright}
                </section>
            </footer>
        );
    }
}

module.exports = Footer;
