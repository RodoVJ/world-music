import react from 'react';
import { BsFillSkipBackwardFill, BsFillSkipForwardFill, BsFillVolumeDownFill, BsPauseFill, BsPlayFill } from 'react-icons/bs';
import './PlayBar.css'

export default class PlayBar extends react.Component {

    constructor(props) {
        super(props);
        this.barTimer = null;
        this.props = props;
        this.player = props.player;
        this.state = {
            playing: false,
            track_info: {
                name: "",
                artists: "",
                duration: 0,
                position: 0,
                albumURI: "",
            },
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.player !== this.props.player) {
            this.player = this.props.player;
        }
        if (prevProps !== this.props) {
            this.setState({track_info: this.props.track_info});
            await this.setState({playing: this.props.playing});
            this.setTimer();
        }
    }

    playNextTrack() {
        this.player.nextTrack();
    }

    playPreviousTrack() {
        this.player.previousTrack();
    }

    togglePlay() {
        this.player.togglePlay();
    }

    setVolume() {
        var volume = document.getElementById('myRange').value;
        this.props.setVolume(volume);
    }

    setTimer() {
        document.getElementById('progress-bar').value = this.state.track_info.position;
        clearInterval(this.barTimer);
        if (this.state.playing) {
            this.barTimer = setInterval(()=>this.updateProgressBar(), 1000);
        }
    }

    updateProgressBar() {
        var progressBar = document.getElementById('progress-bar');
        var val = parseInt(progressBar.value);
        progressBar.value =  val + 1000;
        document.getElementById('curr-progress').innerHTML = this.formatTime(progressBar.value);
    }

    setTrackPos() {
        var deviceId = this.props.deviceId;
        var token = this.props.token;
        var pos = document.getElementById('progress-bar').value;
        fetch(`https://api.spotify.com/v1/me/player/seek?device_id=${deviceId}&position_ms=${pos}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    }

    /**
     * Format milliseconds in minutes and seconds
     * @param {*} time_ms time in milliseconds
     * @returns string with time formatted as hours : seconds
     */
    formatTime(time_ms) {
        var minutes = Math.floor(time_ms / 60000);
        var seconds = parseInt((time_ms / 60000 - minutes) * 60);
        seconds = seconds<10?"0"+seconds:seconds;
        return `${minutes}:${seconds}`;
    }

    render() {
        return(
            <div className={'bar'}>
                
                <div style={{textAlign: 'center'}}>

                    {/* Country and track info */}
                    <span style={{float: 'left', width: '25em', overflow: 'auto'}}> 
                            <a className="country-name" target='_blank' rel="noreferrer"  href={`https://open.spotify.com/playlist/${this.state.track_info.albumURI}`} >{this.props.country}</a>
                            <span className="vl"></span>
                            <span className='track-name-artists'>
                                <div>
                                    {this.state.track_info.name}
                                </div>
                                <div style={{fontSize: '11px', color: 'rgb(185, 185, 185)'}}>
                                    {this.state.track_info.artists}
                                </div>
                            </span>
                    </span>

                    {/* Play/pause button */}
                    <span style={{marginRight: '12.5em'}}>
                        <span className='prev-next-bttn' onClick={()=>this.playPreviousTrack()} > <BsFillSkipBackwardFill size={20}/> </span>
                        <button className={'play-button'} onClick={()=>this.togglePlay()}>
                            {this.state.playing? <BsPauseFill style={{borderRight: 'solid transparent 0.3em'}}  size={29}/> : <BsPlayFill size={28}/> }
                        </button>
                        <span className='prev-next-bttn' onClick={()=>this.playNextTrack()} > <BsFillSkipForwardFill size={20}/> </span>
                    </span>

                    {/* Volume control */}
                    <span style={{float: 'right', margin: '10px'}}>
                        <BsFillVolumeDownFill color='white' size={25}/>
                        <input defaultValue='10'  onMouseUp={()=>this.setVolume()} type="range" min="0" max="100" className="slider" id="myRange"></input>
                    </span>
                </div>
                
                {/* Track control */}
                <div style={{textAlign:'center', color: 'white', marginRight: '24em'}}>
                    <span style={{marginBottom: '1em'}} id='curr-progress'> 0:00 </span>
                    <input style={{width:'50%'}} type="range" id="progress-bar" onMouseUp={()=>this.setTrackPos()} defaultValue="0" max={this.state.track_info.duration}/>
                    <span>{this.formatTime(this.state.track_info.duration)}</span>
                </div>     
            </div>
        );
    }
}