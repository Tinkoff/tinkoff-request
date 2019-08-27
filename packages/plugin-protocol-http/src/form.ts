import each from '@tinkoff/utils/array/each';
import eachObj from '@tinkoff/utils/object/each';
import isArray from '@tinkoff/utils/is/array';
import isNil from '@tinkoff/utils/is/nil';

import FormData from 'form-data';

export default (payload, attaches = []) => {
    const form = new FormData();

    const setField = (value, name) => {
        if (isArray(value)) {
            return each((f) => setField(f, name), value);
        }

        if (isNil(value)) {
            return;
        }

        form.append(name, value);
    };

    eachObj(setField, payload);

    attaches.forEach((file) => {
        if (!(file instanceof window.Blob)) {
            return;
        }

        const fileUploadName = (file as any).uploadName || (file as any).name;
        const fileFieldName = (file as any).fieldName || 'file';

        form.append(fileFieldName, file, encodeURIComponent(fileUploadName));
    });

    return form;
};
