import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import {ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useState, useEffect } from "react";

type RaceCategory = 'greyhound' | 'harness' | 'horse';

const RaceCategoryId: { [key in RaceCategory]: string } = {
    'greyhound': "9daef0d7-bf3c-4f50-921d-8e818c60fe61",
    'harness': "161d9be2-e909-4326-8c2c-35ed71fb460b",
    'horse': "4a2788f8-e825-4d36-9894-efd4baf1cfae",
};

interface Race {
    race_id: string;
    race_number: number;
    category_id: string;
    meeting_name: string;
    advertised_start: { seconds: number };
}

interface RacesState {
    currentDateTime: number;
    categoryId: string;
    races: Race[];
}

/**
 * 
 * @returns Races from the endpoint in a list
 */
const getRaces = (): Promise<Race[]> => {
    return fetch(`https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=40`)
    .then(response => response.json())
    .then(({ data }) => {
        const { next_to_go_ids: race_ids, race_summaries: races } = data;
        return race_ids.map((id: string) => races[id]);
    });
}

const currentTime = () => {
    return Math.floor(Date.now() / 1000);
};

/**
 * 
 * @param start_time unix timestamp of the start of the race
 * @param current_time local time
 * @returns 
 */
const formatCountdown = (start_time: number, current_time: number) => {
    const time_left = start_time - current_time;

    // The event is occurring
    if (time_left <= 0) {
        return 'now';
    } else if (time_left / 60 >= 1) {
        return `${Math.ceil(time_left / 60)}m`;
    }

    return `${time_left}s`;
};

/**
 * 
 * @returns Its the Upcoming Race component
 */
const Races = () => {
    const [state, setState] = useState<RacesState>({
        currentDateTime: currentTime(),
        categoryId: RaceCategoryId['greyhound'],
        races: []
    });

    useEffect(() => {
        getRaces().then(races => {
            setState({
                ...state,
                races,
            });
        });
    }, []);

    const updateRaces = () => {
        // TODO: Clear old races & fetch more if needed
        setState({
            ...state,
            currentDateTime: currentTime(),
        });
    };

    useEffect(() => {
        const timeout = setTimeout(updateRaces, 1000);
        
        return () => clearTimeout(timeout);
    });
        
    return (
        <div>
            <div className="top-bar">
                <h1>Upcoming Races</h1>
                <ToggleButtonGroup
                    className="toggle-categories"
                    color="primary"
                    value={state.categoryId}
                    exclusive
                    onChange={(_, value) => setState({ ...state, categoryId: value })}>
                    <ToggleButton value={RaceCategoryId['greyhound']}>
                        Greyhound
                    </ToggleButton>
                    <ToggleButton value={RaceCategoryId['harness']}>
                        Harness
                    </ToggleButton>
                    <ToggleButton value={RaceCategoryId['horse']}>
                        Horse
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <TableContainer className="races">
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead className="header-columns">
                    <TableRow>
                        <TableCell align="left">Meeting Name</TableCell>
                        <TableCell align="left">Race Number</TableCell>
                        <TableCell className="countdown-timer">Countdown</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.races
                            .filter(race => race.category_id === state.categoryId)
                            .sort((a, b) => a.advertised_start.seconds - b.advertised_start.seconds)
                            .splice(0, 5)
                            .map((race: Race) => (
                                <TableRow key={race.race_id}>
                                    <TableCell align="left">{race.meeting_name}</TableCell>
                                    <TableCell align="left">{race.race_number}</TableCell>
                                    <TableCell>
                                        {formatCountdown(race.advertised_start.seconds, state.currentDateTime)}
                                    </TableCell>
                                </TableRow>
                        ))}
                        
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Races;
