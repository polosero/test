ACCESS_CODE = null;


function fetchIndex(data) {
    return XHR(
        'PUT',
        '/pub/access/123.456/index',
        data
    ).then(drawIndex)
     .catch(console.error);
}

function loginSubmit(form, event) {
    event.stopPropagation();
    event.preventDefault();
    const data = extract(form);
    ACCESS_CODE = data.code;
    fetchIndex(data);
    form.reset();
}

function updateSubmit(form, event) {
    event.stopPropagation();
    event.preventDefault();
    const data = extract(form);
    data.code = ACCESS_CODE;
    XHR(
        'PUT',
        '/pub/access/123.456/update',
        data
    ).then(response => {
        fetchIndex({ code: ACCESS_CODE })
        .then(updateClose);
    }).catch(console.error);
}

function addSnip(docid) {
    XHR(
        'POST',
        `/pub/access/123.456/${Number(docid)}`,
        { code: ACCESS_CODE }
    ).then(fetchIndex.bind(null, { code: ACCESS_CODE }))
     .catch(console.error);
}

function loadImage(loreid) {
    XHR(
        'PUT',
        '/pub/access/123.456/img',
        { code: ACCESS_CODE, id: loreid },
        true
    ).then(img => {
        document.getElementById(`lore-${loreid}`).querySelector('.img')
            .insertAdjacentElement('afterbegin', img);
    }).catch(console.error);
}

function submitImage(files, loreid) {
    XHR(
        'PUT',
        '/pub/access/123.456/img/set',
        { code: ACCESS_CODE, id: loreid, img: files[0] }
    ).then(fetchIndex.bind(null, { code: ACCESS_CODE }))
     .catch(console.error);
}

function deleteImage(loreid) {
    XHR(
        'PUT',
        '/pub/access/123.456/img/set',
        { code: ACCESS_CODE, id: loreid }
    ).then(fetchIndex.bind(null, { code: ACCESS_CODE }))
     .catch(console.error);
}



function logout() {
    ACCESS_CODE = null;
    this.location.reload();
}

function updateOpen(data) {
    const form = document.getElementById('update-dialog');
    setValues(form, data);
    form.hidden = false;
}

function updateClose() {
    document.getElementById('update-dialog').hidden = true;
}



function drawIndex(response) {
    document.getElementById('login').hidden = true;
    const index = document.getElementById('index');
    index.innerHTML = '';
    index.hidden = false;
    let document_name = null;
    for (const lore of response) {
        if (lore.document_name !== document_name) {
            document_name = lore.document_name;
            index.innerHTML += `
                <h2> ${e(document_name)} </h2>
                <button type="button" onclick="addSnip(${Number(lore.document_id)})">
                    +
                </button>`;
        }
        index.innerHTML += `<article id="lore-${lore.id}">
                <p>${md(lore.content)}</p>
                <button type="button"> &#x270e; </button>
                <div class="img">
                    <button type="button" onclick="deleteImage(${lore.id})"> &#10060; </button>
                    <input type="file" name="img" onchange="submitImage(this.files, ${lore.id})" />
                </div>
            </article>`;
    }
    setTimeout(drawIndex_binding.bind(null, response));
}

function drawIndex_binding(response) {
    for (const lore of response) {
        const article = document.getElementById(`lore-${lore.id}`);
        article.querySelector('button').addEventListener(
            'click',
            updateOpen.bind(null, lore),
        );
        lore.has_img && loadImage(lore.id);
    }
}
