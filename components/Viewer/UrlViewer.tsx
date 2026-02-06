import React from 'react';

export default function UrlViewer({url}: { url: string, }) {
    return (
        <iframe src={url} style={{width: '100%', height: '100%', border: 'none'}}></iframe>
    );
}