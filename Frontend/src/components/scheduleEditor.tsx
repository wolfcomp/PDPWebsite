import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useModal } from "../components/modal";
import { Schedule } from "../structs/schedule";
import { DateTime } from "luxon";
import { Dropdown, Tooltip } from "bootstrap";
import { useRequest } from "./request";
import { useToast } from "./toast";

export default function ScheduleEditor(props: { mobile: boolean }) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeRef = useRef<HTMLDivElement>(null);
    const pageSizeDropdown = useRef<Dropdown>();
    const modal = useModal();
    const request = useRequest().request;
    const toast = useToast().toast;

    async function getSchedules() {
        var res = await request("/api/schedule/all");
        if (!res.ok)
            return;
        setSchedules(((await res.json()) as Schedule[]).map(t => new Schedule(t.id, t.name, t.hostId, t.hostName, t.duration, t.at)));
    }

    function nextPage(e: MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        if (page + 1 < Math.ceil(schedules.length / pageSize)) {
            setPage(page + 1);
        }
    }

    function prevPage(e: MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        if (page > 0) {
            setPage(page - 1);
        }
    }

    function getPageButtons() {
        function getButton(pageNumber: number, text?: string | ReactNode, func?: (e: MouseEvent<HTMLAnchorElement>) => void, shouldDisable?: boolean) {
            if (!func)
                func = () => setPage(pageNumber);
            return <li className={"page-item" + (page === pageNumber ? (shouldDisable ? " disabled" : " active") : "")} key={"page" + (shouldDisable ? func.name : pageNumber)}><a className="page-link" onClick={func}>{text || pageNumber + 1}</a></li>;
        }
        function getEllipsis(num: number) {
            return <li className="page-item disabled" key={"ellipsis" + num}><a className="page-link">...</a></li>;
        }
        var buttons = [];
        buttons.push(getButton(0, <>&laquo;</>, prevPage, true));

        if (Math.ceil(schedules.length / pageSize) > 5 && page > 3) {
            buttons.push(getButton(0));
            buttons.push(getEllipsis(0));
        }
        var minPage = 0;
        if (Math.ceil(schedules.length / pageSize) > 5 && page > 3) {
            minPage = Math.ceil(schedules.length / pageSize) - 5;
        }
        if (Math.ceil(schedules.length / pageSize) > 5 && page > 3 && page < Math.ceil(schedules.length / pageSize) - 3) {
            buttons.push(getButton(page - 1));
            buttons.push(getButton(page));
            buttons.push(getButton(page + 1));
        }
        else {
            for (var i = 0; i < Math.min(5, Math.ceil(schedules.length / pageSize)); i++) {
                buttons.push(getButton(minPage + i));
            }
        }
        if (Math.ceil(schedules.length / pageSize) > 5 && page < Math.ceil(schedules.length / pageSize) - 3) {
            buttons.push(getEllipsis(1));
            buttons.push(getButton(Math.ceil(schedules.length / pageSize) - 1));
        }

        buttons.push(getButton(Math.ceil(schedules.length / pageSize) - 1, <>&raquo;</>, nextPage, true));
        return buttons;
    }

    function setPageSizeAndReset(e: MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        var size = parseInt(e.currentTarget.textContent || "10");
        setPageSize(size);
        setPage(0);
    }

    useEffect(() => {
        getSchedules();
    }, [setSchedules]);

    function exportBuffer() {
        var schedulesByDay = schedules.map((schedule) => {
            var startOfDay = schedule.getStart().setZone("America/Los_Angeles").startOf("day");
            var weekday = startOfDay.weekday;
            var week = startOfDay.weekNumber;
            var year = startOfDay.year;
            var day = "";
            switch (weekday) {
                case 1:
                    day = "Monday";
                    week -= 1;
                    break;
                case 2:
                    day = "Tuesday";
                    break;
                case 3:
                    day = "Wednesday";
                    break;
                case 4:
                    day = "Thursday";
                    break;
                case 5:
                    day = "Friday";
                    break;
                case 6:
                    day = "Saturday";
                    break;
                case 7:
                    day = "Sunday";
                    break;
            }
            return {
                name: schedule.name,
                host: schedule.hostName ? schedule.hostName.split(" ")[0] : "N/A",
                time: schedule.getStart(),
                day: day,
                week: week,
                year: year
            };
        }).reduce((acc: { [key: string | number]: { [key: string | number]: { [key: string]: { name: string, host: string, time: DateTime, day: string, week: number }[] } } }, cur) => {
            if (!acc[cur.year]) {
                acc[cur.year] = {};
            }
            if (!acc[cur.year][cur.week]) {
                acc[cur.year][cur.week] = {};
            }
            if (!acc[cur.year][cur.week][cur.day]) {
                acc[cur.year][cur.week][cur.day] = [];
            }
            acc[cur.year][cur.week][cur.day].push(cur);
            return acc;
        }, {});
        var t = schedules[0].getStart();
        console.log(t.toUnixInteger(), t.offset);
        var buffer = "";
        Object.keys(schedulesByDay).forEach((year) => {
            buffer += `Year ${year}\n`;
            Object.keys(schedulesByDay[year]).forEach((week) => {
                buffer += `Week ${week}\n`;
                Object.keys(schedulesByDay[year][week]).forEach((day) => {
                    buffer += `**${day}**\n`;
                    schedulesByDay[year][week][day].forEach((schedule) => {
                        buffer += `- ${schedule.name}: <t:${schedule.time.toUnixInteger()}:F> [${schedule.host}]\n`;
                    });
                });
                buffer += "\n";
            });
            buffer += "\n";
        });
        //send buffer into clipboard
        navigator.clipboard.writeText(buffer);
        toast("Copied to clipboard", "Schedule Editor", "success");
    }

    useEffect(() => {
        if (pageSizeRef.current) {
            pageSizeDropdown.current = new Dropdown(pageSizeRef.current);
        }
        return () => pageSizeDropdown.current?.dispose();
    });

    return (
        <div className="mt-4 row pb-2 pt-2 rounded-3" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className="d-flex mb-3">
                <h2 className="me-auto">Host Section</h2>
                <div className="d-flex flex-wrap align-content-center">
                    <button className="btn btn-success me-2" onClick={() => exportBuffer()} >Export Schedule</button>
                    <button className="btn btn-primary" onClick={() => modal(<ScheduleEditModal schedule={new Schedule("", "", "", "", "00:00", DateTime.local().toFormat("yyyy-MM-dd'T'hh:mm"))} />)}>Add new event</button>
                </div>
            </div>
            <ul className="list-group" style={{ paddingLeft: "calc(var(--bs-gutter-x) * 0.5)" }}>
                {schedules.sort((a, b) => b.getStart().diff(a.getStart(), "days").days).slice(page * pageSize, page * pageSize + pageSize).map((schedule) => <ScheduleTableItem key={schedule.id} schedule={schedule} mobile={props.mobile} />)}
            </ul>
            <nav>
                <div className="d-flex justify-content-end mt-2">
                    <div className="dropdown me-2" ref={pageSizeRef}>
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {pageSize}
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" onClick={setPageSizeAndReset}>10</a></li>
                            <li><a className="dropdown-item" onClick={setPageSizeAndReset}>20</a></li>
                            <li><a className="dropdown-item" onClick={setPageSizeAndReset}>50</a></li>
                            <li><a className="dropdown-item" onClick={setPageSizeAndReset}>100</a></li>
                        </ul>
                    </div>
                    <ul className="pagination col-4 text-center">
                        {getPageButtons()}
                    </ul>
                </div>
            </nav>
        </div >
    );
}

function ScheduleTableItem(props: { schedule: Schedule, mobile: boolean }) {
    const { schedule, mobile } = props;
    const infoRef = useRef<HTMLElement>(null);

    const modal = useModal();

    useEffect(() => {
        if (!infoRef.current)
            return;
        var time = "Local: " + schedule.getStart().toLocal().toLocaleString(DateTime.DATETIME_MED);
        var tooltip = new Tooltip(infoRef.current, { container: "body", title: time, placement: "top", html: true });
        return () => tooltip.dispose();
    }, [infoRef]);

    return (
        <li className="list-group-item">
            <div className="d-flex flex-wrap">
                <span className={"me-3" + (mobile ? " col-12" : "")}><b>Name: </b>{schedule.name}</span>
                <span className={"me-3" + (mobile ? " col-12" : "")}><b>Host: </b>{schedule.hostName ?? (<i><sub style={{ bottom: 2, fontSize: "0.7rem" }}>N/A</sub></i>)}</span>
                <span className={"me-3" + (mobile ? " col-12" : "")}><b>Duration: </b>{schedule.duration}</span>
                <span className={"me-auto" + (mobile ? " col-12" : "")}><b>At: </b>{schedule.getStart().toLocaleString(DateTime.DATETIME_MED)}  <i ref={infoRef} className="bi bi-info-circle-fill"></i></span>
                <div className="d-flex flex-wrap align-content-center">
                    <button className="btn btn-danger me-2" onClick={() => modal(<ScheduleDeleteModal schedule={schedule} />)} >Delete</button>
                    <button className="btn btn-secondary" onClick={() => modal(<ScheduleEditModal schedule={schedule} />)}>Edit</button>
                </div>
            </div>
        </li>
    );
}

function ScheduleDeleteModal(props: { schedule: Schedule }) {
    const modal = useModal();
    const request = useRequest().request;
    const infoRef = useRef<HTMLElement>(null);

    const schedule = props.schedule;

    async function del() {
        await request("/api/schedule/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: `"${schedule.id}"`
        });

        modal(null);
    }

    useEffect(() => {
        if (!infoRef.current)
            return;
        var time = "Local: " + schedule.getStart().toLocal().toLocaleString(DateTime.DATETIME_MED);
        var tooltip = new Tooltip(infoRef.current, { container: "body", title: time, placement: "top", html: true });
        return () => tooltip.dispose();
    }, [infoRef]);

    return (<>
        <div className="modal-header">
            <h5 className="modal-title">Are you sure you want to delete.</h5>
        </div>
        <div className="modal-body">
            <p className="text-center text-break"><b>Name: </b>{schedule.name}</p>
            <p className="text-center text-break"><b>Host: </b>{schedule.hostName}</p>
            <p className="text-center text-break"><b>Duration: </b>{schedule.duration}</p>
            <p className="text-center text-break"><b>At: </b>{schedule.getStart().toLocaleString(DateTime.DATETIME_MED)} <i ref={infoRef} className="bi bi-info-circle-fill"></i></p>
        </div>
        <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => modal(null)}>Close</button>
            <button type="button" className="btn btn-danger" onClick={del}>Confirm</button>
        </div>
    </>);
}

function ScheduleEditModal(props: { schedule: Schedule }) {
    const modal = useModal();
    const [schedule, setSchedule] = useState(props.schedule);
    const [hosts, setHosts] = useState<{ id: string, name: string, avatar: string }[]>([]);
    const [dropdown, setDropdown] = useState<Dropdown>();
    const dropdownRef = useRef<HTMLButtonElement>(null);
    const request = useRequest().request;

    useEffect(() => {
        getHosts();
    }, [setHosts, setDropdown]);

    useEffect(() => {
        if (!dropdownRef.current) {
            var dropdown = new Dropdown(dropdownRef.current!);
            setDropdown(dropdown);
        }
        return () => dropdown?.dispose();
    }, [hosts, setDropdown]);

    async function getHosts() {
        var res = await request("/api/aboutinfo/users");
        if (!res.ok)
            return;
        setHosts(await res.json());
    }

    async function create() {
        var res = await request("/api/schedule/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: schedule.name,
                hostId: schedule.hostId,
                duration: schedule.duration,
                at: schedule.at
            })
        });
        if (!res.ok)
            return;
        modal(null);
    }

    async function update() {
        var res = await request("/api/schedule/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: schedule.id,
                name: schedule.name,
                hostId: schedule.hostId,
                duration: schedule.duration,
                at: schedule.at
            })
        });
        if (!res.ok)
            return;
        modal(null);
    }

    function save() {
        if (schedule.id === "") {
            create();
        } else {
            update();
        }
        modal(null);
    }

    return (<>
        <div className="modal-header">
            <h5 className="modal-title">Schedule Editor</h5>
            <span>Times are set in local time.</span>
        </div>
        <div className="modal-body">
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" className="form-control" id="name" value={schedule.name} onChange={(e) => {
                    e.preventDefault();
                    setSchedule(new Schedule(schedule.id, e.target.value.substring(0, Math.min(e.target.value.length, 32)), schedule.hostId, schedule.hostName, schedule.duration, schedule.at));
                }} maxLength={32} />
            </div>
            <div className="form-group">
                <span>Host: </span>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" ref={dropdownRef}>
                        {schedule.hostId === "" ? "Select host" : <>
                            <img src={hosts.find((host) => host.id === schedule.hostId)?.avatar} style={{ width: 32, height: 32 }} className="rounded-5 me-2" alt="User picture" />
                            <span>{hosts.find((host) => host.id === schedule.hostId)?.name}</span>
                        </>}
                    </button>
                    <ul className="dropdown-menu" style={{ maxHeight: "20rem", overflowY: "scroll" }}>
                        {hosts.map((host) => <li key={host.id} ><a className="dropdown-item" href="#" onClick={(e) => {
                            e.preventDefault();
                            setSchedule(new Schedule(schedule.id, schedule.name, host.id, host.name, schedule.duration, schedule.at));
                            dropdown?.hide();
                        }}><img src={host.avatar} style={{ width: 32, height: 32 }} className="rounded-5 me-2" alt="User picture" />{host.name}</a></li>)}
                    </ul>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="from">From</label>
                <input type="datetime-local" className="form-control" id="from" value={schedule.getSelector()} onChange={(e) => {
                    e.preventDefault();
                    setSchedule(new Schedule(schedule.id, schedule.name, schedule.hostId, schedule.hostName, schedule.duration, DateTime.fromFormat(e.target.value, "yyyy-MM-dd'T'HH:mm").toUTC().toISO()));
                }} />
            </div>
            <div className="form-group">
                <label htmlFor="to">To</label>
                <input type="datetime-local" className="form-control" id="to" value={schedule.getSelectorEnd()} onChange={(e) => {
                    e.preventDefault();
                    var to = DateTime.fromISO(e.target.value).toUTC();
                    var from = schedule.getStart();
                    var duration = to.diff(from, ["minutes", "hours"]);
                    var time = `${Math.floor(duration.hours)}:${Math.floor(duration.minutes / 5) * 5}`;
                    setSchedule(new Schedule(schedule.id, schedule.name, schedule.hostId, schedule.hostName, time, schedule.at));
                }} step={5 * 60} max={8 * 60 * 60} />
            </div>
        </div>
        <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => modal(null)}>Close</button>
            <button type="button" className="btn btn-primary" onClick={save}>Save changes</button>
        </div>
    </>);
}