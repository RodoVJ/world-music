import React from 'react';
import PlayBar from '../playBar/PlayBar';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import './SpotifyPlayer.css';

export default class SpotifyPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            loggedIn: false, 
            deviceId: null,
            token: "",
            country: props.country,
            track_info : {
                name: "",
                artists: "",
                duration: 0,
                position: 0,
                albumURI: "",
            },
            playing: false,
        };
        this.playerCheckInterval = null;
        this.setVolume = this.setVolume.bind(this); 
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.country !== this.props.country) {
            await this.setState({country: this.props.country});
            this.playTrack();
        }
    }

    getToken() {
        var windowURL = window.location.hash
        var querystring = "?" + windowURL.substr(1, windowURL.length);
        const urlSearch = new URLSearchParams(querystring);
        const token  = urlSearch.get('access_token');
        return token;
    }

    async handleLogin() {
        await this.setState({token: this.getToken()});
        if (this.state.token !== "") {
            this.setState({ loggedIn: true });
            // check every second for the player.
            this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
            document.getElementById('loading-spinner').style.display = 'block';
            document.getElementById('get-jamming-bttn').style.display = 'none';
        }
    }

    checkForPlayer() {
        if (window.Spotify !== null) {
            clearInterval(this.playerCheckInterval);
            this.player = new window.Spotify.Player({
                name: "Around The World Player",
                getOAuthToken: cb => { cb(this.state.token); },
            });
            this.createEventHandlers();
            this.player.connect();
            document.getElementById('myModal').style.display = 'none';
        }
    }

    
    createEventHandlers() {
        this.player.on('initialization_error', e => { console.error(e); });
        this.player.on('authentication_error', e => {
            console.error(e);
            this.setState({ loggedIn: false });
        });
        this.player.on('account_error', e => { console.error(e); });
        this.player.on('playback_error', e => { console.error(e); });
      
        // Playback status updates
        this.player.on('player_state_changed', state => {
            // console.log(state); 
            var {name, artists} = state.track_window.current_track;
            var {duration, position} = state;
            var isPlaying = !state.paused;
            
            artists = artists.map(a => a.name).join(", ");
            this.setState(prevState => (
                {track_info : {name, artists, duration, position, albumURI: prevState.track_info.albumURI}}
            ));
             this.setState({playing: isPlaying});
        });
      
        // Ready
        this.player.on('ready', data => {
            let { device_id } = data;
            this.setState({ deviceId: device_id });
            this.setVolume(10);
        });
    }

    async getPlaylist(country, token) {
        var tracks;
        var playlistUID = {
            "Germany": "4L6pZ0ihP6RN35WcyvZQJB",
            "United States": "6SXqTPTGz3FXZ7JZgrTa6S",
            "Brazil": "5KHbclM6e6EVONQirubFMO",
            "Canada": "7EeZTIWCXCGbeiEclJoBBn",
            "France": "0TM63udBodwHZE7jCXw5Pc",
            "Russia": "4r1bqx0pcl99LWew9pSGEL",
            "Mexico": "4KEDTn9diHpbSeMAORDfS6",
            "Australia": "2XVNjIYqXmzPbneYemRrix",
            "South Africa": "6KeYZIeYiElx86iOhDigH3",
            "China": "1otAiOltVxRirrrH50hfWx",
            "India": "4PHxzXyPsm2O89BUQZ79mU",
            "Nigeria": "0gpwdCWOt1eBCX9QkvIk7J",
            "United Kingdom": "7enaPLxfS4owel1hFBW7KU",
            "Colombia": "0nK6y27PHOAsWc24VchHNb",
            "Costa Rica": "65kdQo5kDLvb1971RY8pOy",
            "Spain": "2Pwbi4SQiROWX2SSwlGHNH",
            "Egypt": "3dM8mbIAa94xP71GdAWfPD",
            "Jamaica": "64IoS9dnXVYAjAEKrmbOnq",
            "Bolivia": "1vzZRy7kp4rn7ZgV0RdP8p",
            "Poland": "7B8G22apRJ4pSGLhJI8ph4",
            "Algeria": "5AwXHaHjXeAdViA0fYX4Wh",
            "Italy": "2TtVE9heBUr1c4hmIQhIpQ",
            "Japan": "6Ul144kSbf8uO2plqc2kC0",
        };
    
        await fetch(`https://api.spotify.com/v1/playlists/${playlistUID[country]}?fields=tracks.items(track(uri, name))`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(response => response.json())
        .then(data => tracks = data.tracks.items);
        this.setState(prevState => ({
            track_info: {...prevState.track_info, albumURI: playlistUID[country]} 
        }));
        return tracks;
    }

    async playTrack() {
        const { deviceId, token, country } = this.state;
        var tracks = await this.getPlaylist(country, token);
        var uris = tracks.map(t => t.track.uri);

        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "uris": uris,
          }),
        });
    }

    setVolume(volume) {
        const {deviceId, token} = this.state;
        fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    }

    render() {
        let modal;
        // If there is no token present, ask the user to log in
        if (!this.getToken()) 
            modal = <div className={'myModal'}> 
                        <Button 
                            variant='success' onClick={()=> window.location.href='http://localhost:8088/login'}> 
                            Log In to Spotify
                        </Button> 
                    </div>;
        // Connect to the web player 
        else 
            modal =
            <div id={'myModal'} className={'myModal'}> 
                <Button variant="success" onClick={()=>this.handleLogin()}>
                    <Spinner
                        id={'loading-spinner'}
                        style={{display: 'none'}}
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span className="sr-only">Loading...</span>
                    <div id="get-jamming-bttn"> Get Jamming 🎵 </div>
                </Button>
            </div>;

        return(
            <div>
                {modal}
                <PlayBar country={this.state.country} token={this.state.token} deviceId={this.state.deviceId} track_info={this.state.track_info} player={this.player} playing={this.state.playing} setVolume={this.setVolume} 
                device_id={this.state.deviceId}/>
            </div>
        );
    }

}