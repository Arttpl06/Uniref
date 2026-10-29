import { Link } from "react-router-dom";

function Button({ label, to, onClick, type = "button" }) {
    const className = "btn btn-primary mt-4 w-100";

    if (to) {
        return <Link to={to} className={className}>{label}</Link>;
    }

    return (
        <button type={type} className={className} onClick={onClick}>
            {label}
        </button>
    );
} export default Button;
