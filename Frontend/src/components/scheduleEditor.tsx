import { useEffect, useRef, useState } from "react";
import { useModal } from "../components/modal";
import { Schedule } from "../structs/schedule";
import { DateTime } from "luxon";
import { Dropdown, Tooltip } from "bootstrap";
import { useRequest } from "./request";
import { useToast } from "./toast";

export default function ScheduleEditor(props: { schedules: Schedule[], mobile: boolean }) {
    const modal = useModal();
    const toast = useToast().toast;

    function exportBuffer() {
        var schedulesByDay = props.schedules.map((schedule) => {
            var startOfDay = schedule.getStart().setZone("America/Los_Angeles").startOf("day");
            var weekday = startOfDay.weekday;
            var week = startOfDay.weekNumber;
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
                host: schedule.hostName.split(" ")[0],
                time: schedule.getStart(),
                day: day,
                week: week
            };
        }).reduce((acc: { [key: string | number]: { [key: string]: { name: string, host: string, time: DateTime, day: string, week: number }[] } }, cur) => {
            if (!acc[cur.week]) {
                acc[cur.week] = {};
            }
            if (!acc[cur.week][cur.day]) {
                acc[cur.week][cur.day] = [];
            }
            acc[cur.week][cur.day].push(cur);
            return acc;
        }, {});
        var t = props.schedules[0].getStart();
        console.log(t.toUnixInteger(), t.offset);
        var buffer = Object.keys(schedulesByDay).map((week) => {
            return `Week ${week}\n` + Object.keys(schedulesByDay[week]).map((day) => {
                return `**${day}**\n` + schedulesByDay[week][day].map((schedule) => {
                    return `- ${schedule.name}: <t:${schedule.time.toUnixInteger()}:F> [${schedule.host}]`;
                }).join("\n");
            }).join("\n\n");
        }).join("\n\n");
        //send buffer into clipboard
        navigator.clipboard.writeText(buffer);
        toast("Copied to clipboard", "Schedule Editor", "success");
    }

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
                {props.schedules.sort((a, b) => a.getStart().diff(b.getStart(), "days").days).map((schedule) => <ScheduleTableItem key={schedule.id} schedule={schedule} mobile={props.mobile} />)}
            </ul>
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
                <span className={"me-3" + (mobile ? " col-12" : "")}><b>Host: </b>{schedule.hostName}</span>
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