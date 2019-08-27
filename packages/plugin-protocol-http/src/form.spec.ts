import createForm from './form';

describe('plugins/http/form', () => {
    it('should transform payload into multi-part form-encoded view', () => {
        const form = createForm({ a: 1, b: [1, 2, 3], c: 'test' });
        const boundary = form.getBoundary();

        expect(form.getHeaders()).toEqual({
            'content-type': expect.stringContaining('multipart/form-data'),
        });

        expect(
            form
                .getBuffer()
                .toString()
                .replace(/\r\n/g, '\n')
        ).toEqual(`--${boundary}
Content-Disposition: form-data; name="a"

1
--${boundary}
Content-Disposition: form-data; name="b"

1
--${boundary}
Content-Disposition: form-data; name="b"

2
--${boundary}
Content-Disposition: form-data; name="b"

3
--${boundary}
Content-Disposition: form-data; name="c"

test
--${boundary}--
`);
    });
});
