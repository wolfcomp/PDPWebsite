import { useEffect, useState } from "react";
import "./slideshow.scss";

function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export default function Slideshow() {
    const [images, setImages] = useState<string[]>([]);
    const [spoilerImages, setSpoilerImages] = useState<string[]>([]); // currently not in use due to no toggle for spoilers
    const [currentImage, setCurrentImage] = useState<string>("");
    const [nextImage, setNextImage] = useState<string>("");
    const [lastUpdate, setLastUpdate] = useState<{ time: Date, delta: number }>({ time: new Date(), delta: 0 });
    const [state, setState] = useState<"shifting-in" | "shifting-out" | "shifted" | "shifted-prepared">("shifted");

    async function getImages(path?: string) {
        const resp = await fetch("https://pdp.wildwolf.dev/victoryposes/" + (path ? path : ""));
        const data = await resp.text();
        const domData = new DOMParser().parseFromString(data, "text/html");
        return Array.from(domData.querySelectorAll("body > pre > a") as NodeListOf<HTMLAnchorElement>).map(t => t.href.replace(t.baseURI, "")).slice(1);
    }

    useEffect(() => {
        getImages().then(
            (data) => {
                getImages(data[0]).then(
                    (data) => setSpoilerImages(shuffle(data)),
                    (err) => console.error(err)
                );
                var data = shuffle(data.slice(1));
                setImages(data);
                setCurrentImage(data[0]);
                setNextImage(data[1]);
                setLastUpdate({ time: new Date(), delta: 0 });
            },
            (err) => console.error(err)
        );
    }, [setImages]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate({ time: new Date(), delta: new Date().getTime() - lastUpdate.time.getTime() + lastUpdate.delta });
        }, 100);
        return () => clearInterval(interval);
    }, [lastUpdate]);

    useEffect(() => {
        if (state === "shifting-in" && lastUpdate.delta > 1000) {
            setState("shifting-out");
            setLastUpdate({ time: new Date(), delta: 0 });
        }
        else if (state === "shifting-out" && lastUpdate.delta > 1000) {
            setState("shifted");
            setLastUpdate({ time: new Date(), delta: 0 });
        }
        else if (state === "shifted" && lastUpdate.delta > 5000) {
            setCurrentImage(nextImage);
            setNextImage(images[images.indexOf(currentImage) + 1]);
            if (images.indexOf(currentImage) + 1 === images.length) {
                setNextImage(images[0]);
            }
            else {
                setNextImage(images[images.indexOf(currentImage) + 1]);
            }
            setState("shifted-prepared");
            setLastUpdate({ time: new Date(), delta: 0 });
        }
        else if (state === "shifted-prepared" && lastUpdate.delta > 2000) {
            setState("shifting-in");
            setLastUpdate({ time: new Date(), delta: 0 });
        }
    }, [lastUpdate]);

    return (
        <div className="slideshow-container">
            {currentImage && <div className={"slideshow-image" + (state == "shifting-out" ? " hidden" : "")} style={{ backgroundImage: `url("https://pdp.wildwolf.dev/victoryposes/${currentImage}")` }} />}
            {nextImage && <div className={"slideshow-image" + (state == "shifting-in" || state == "shifting-out" ? "" : " hidden")} style={{ backgroundImage: `url("https://pdp.wildwolf.dev/victoryposes/${nextImage}")` }} />}
        </div>
    )
}