import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import "./partials.scss";
import { Collapse } from 'bootstrap';
import { createRef, useEffect, useState } from 'react';
import { useSlideshow } from './slideshow';
import { DateTime } from 'luxon';
import getString from './text';

const links = [
    { name: "Home", path: "/", absolute: true, auth: false },
    { name: "About", path: "/about", auth: false },
    { name: "Schedule", path: "/schedule", auth: false },
    { name: "Resources", path: "/resources", auth: false },
    { name: "Slideshow", path: "/slideshow", auth: false },
    { name: "Files", path: "/files", auth: true }
]

export function Header() {
    const auth = useAuth();
    const location = useLocation();
    const { setBlured, navContent } = useSlideshow();
    const collapseRef = createRef<HTMLDivElement>();
    const [collpase, setCollapse] = useState<Collapse>(null);
    const [toggled, setToggled] = useState<boolean>(false);
    const [time, setTime] = useState<DateTime>(DateTime.local());

    useEffect(() => {
        setCollapse(new Collapse(collapseRef.current!, { toggle: false }));
    }, [setCollapse]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(DateTime.local());
        }, 1000);

        return () => clearInterval(interval);
    }, [setTime]);

    function toggleBlur() {
        localStorage.removeItem("blured");
        setBlured(blured => blured === "unblured" ? "unblured" : blured === "blured" ? "default" : "blured");
        setToggled(toggled => !toggled);
    }

    return (
        <nav className='navbar navbar-expand-lg bg-body-tertiary navbar-shadow-bottom' style={{ zIndex: 1 }}>
            <div className='container-fluid'>
                <Link to="/" className='navbar-brand'>{getString("title", time)[0]}</Link>
                <div className="me-2 d-flex align-items-center">
                    <button className="navbar-toggler" type="button" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation" onClick={(e) => {
                        e.preventDefault();
                        collpase?.toggle();
                    }}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                <div className='collapse navbar-collapse justify-content-between' ref={collapseRef}>
                    <ul className='navbar-nav'>
                        {links.filter(link => !link.auth || auth.user).map((link, i) => <li key={`nav-header-${i}`} className='nav-item'>
                            <Link to={link.path} className={`nav-link ${(link.absolute ? link.path === location.pathname : location.pathname.startsWith(link.path)) ? "active" : ""}`}>{getString("nav", time)[i]}</Link>
                        </li>)}
                    </ul>
                    {navContent}
                    <ul className='navbar-nav'>
                        {location.pathname !== "/slideshow" && <div className='form-check form-switch rounded-5' style={{ paddingLeft: "3rem", paddingRight: ".5rem", backgroundColor: "rgba(0,0,0,0.25)" }}>
                            <input className='form-check-input' type='checkbox' id='darkSwitch' onChange={toggleBlur} checked={toggled} />
                            <label className='form-check-label' htmlFor='darkSwitch'>{getString("blur", time)[0]}</label>
                        </div>}
                        <li className='nav-item'>
                            {auth?.user ? <Link to="/logout" className='nav-link'>Logout</Link> : <Link to="/login" className='nav-link'>{getString("login", time)[0]}</Link>}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export function Footer() {
    const [time, setTime] = useState<DateTime>(DateTime.local());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(DateTime.local());
        }, 1000);

        return () => clearInterval(interval);
    }, [setTime]);

    return (
        <>
            <footer className='footer mt-auto py-3 bg-body-tertiary' style={{ position: 'fixed', bottom: 0, width: "100vw" }}>
                <div className='container'>
                    <span className='text-muted'>{getString("footer", time)[0]}</span>
                </div>
            </footer>
            <footer className='footer mt-2 py-3 bg-body-tertiary'>
                <div className='container'>
                    <span className='text-muted'>{getString("footer", time)[0]}</span>
                </div>
            </footer>
        </>
    );
}