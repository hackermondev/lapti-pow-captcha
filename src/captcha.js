/**
 * [lapti-pow-captcha]{@link https://github.com/xenohunter/lapti-pow-captcha}
 *
 * @author Phil Filippak [xenohunter@yandex.ru]
 * @copyright Phil Filippak 2018
 * @license MIT
 */

(function () {

    if (!window.fetch || !window.Promise || !window.Worker) {
        throw new Error('The browser is too old for that stuff!');
    }

    /**
     * Proves the work by finding a hash H(token, nonce) which first chars match the complexity arg
     * @param {string} token
     * @param {number} complexity
     * @return {Promise<string>}
     */
    function prove(token, complexity) {
        var test = Array(complexity + 1).join('0');
        var nonce = 0;
        var result;
        while (++nonce) {
            result = sha3_512(token + nonce);
            if (result.slice(0, complexity) === test) {
                break;
            }
        }
        return Promise.resolve(nonce.toString()); // TODO : with Worker, return synchronously
    }

    /**
     * @param {string} data
     * @param {Function<Promise>} handshake
     * @constructor
     */
    function Captcha(data, handshake) {
        this.data = data || null;
        this.handshake = handshake || null;
    }

    /**
     * Sets of changes data attached to the captcha
     * @param {string} data
     * @return {Captcha}
     */
    Captcha.prototype.setData = function (data) {
        // TODO : deny if captcha is running
        this.data = data;
        return this;
    };

    /**
     * @return {Promise<string>}
     */
    Captcha.prototype.run = function () {
        if (!this.data || !this.handshake) {
            throw new Error('Data or handshake function missing!');
        } else {
            return this.handshake(this.data).then(function (res) {
                if (res && res.token && res.complexity) {
                    return prove(res.token, res.complexity); // TODO : Worker
                } else {
                    throw new Error('Server response is invalid!');
                }
            });
        }
    };

    var LaptiCaptcha = {

        /**
         * Creates a captcha and binds it to the container if it's passed
         * @param {object} props
         * @param {string} [props.data]
         * @param {string} [props.apiUrl]
         * @param {Function<Promise>} [props.handshake]
         * @param {string|HTMLElement} [props.container]
         * @param {Function} [props.onComplete]
         * @return {Captcha}
         */
        create: function (props) {

            if (!props.handshake && props.apiUrl) {
                props.handshake = function (data) {
                    var path = props.apiUrl + '/handshake/' + data;
                    return fetch(path).then(function (res) {
                        return res.json();
                    });
                };
            }

            var captcha = new Captcha(props.data, props.handshake);

            if (props.container) {
                LaptiCaptcha.render(captcha, props);
            }

            return captcha;

        },

        /**
         * Renders a simple view for a given captcha
         * @param {Captcha} captcha
         * @param {object} props
         * @param {string|HTMLElement} props.container
         * @param {Function} props.onComplete
         */
        render: function (captcha, props) {

            var container = props.container;

            if (typeof container === 'string') {
                container = document.getElementById(container);
            }

            var run = function () {
                var dampedData = captcha.data;
                captcha.run().then(function (proof) {
                    container.innerHTML = 'Done!';
                    props.onComplete(dampedData, proof);
                });
            };

            var button = document.createElement('button');
            button.innerText = 'Validate';
            button.onclick = function () {
                button.disabled = true;
                run();
            };

            button.style.padding = '5px 10px';
            button.style.fontSize = '16px';
            button.style.outline = 'none';
            button.style.cursor = 'pointer';

            var link = document.createElement('a');
            link.href = 'https://github.com/xenohunter/lapti-pow-captcha';
            link.target = '_blank';
            link.innerText = 'What is it?';

            link.style.display = 'block';
            link.style.marginTop = '5px';

            container.style.textAlign = 'center';
            container.appendChild(button);
            container.appendChild(link);

        }

    };

    window.LaptiCaptcha = LaptiCaptcha;

})();