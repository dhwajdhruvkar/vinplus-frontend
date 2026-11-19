export default function Toast({ toast }) {
  return <div className="toast" id="toast" hidden={!toast}>{toast?.text}</div>
}
