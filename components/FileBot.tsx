
import React, { useState } from "react";

type Props = {
  botId: string;
  open?: boolean;
  onClose?: () => void;
};

export default function FileBot({ botId, open=false, onClose }: Props) {
  const [visible, setVisible] = useState(open);

  function close() {
    setVisible(false);
    onClose && onClose();
  }

  const src = `/filebrowser/index.html?botId=${encodeURIComponent(botId)}`;

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={close}>
      <div style={{ width: '90%', height: '90%', background: '#fff', borderRadius: 8, overflow: 'hidden' }} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', padding:8, background:'#f3f3f3'}}>
          <div>File Browser — Bot: {botId}</div>
          <button onClick={close}>Close</button>
        </div>
        <iframe src={src} style={{ width:'100%', height:'calc(100% - 40px)', border:0 }} title={`filebrowser-${botId}`}></iframe>
      </div>
    </div>
  );
}
