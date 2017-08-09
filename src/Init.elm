module Init exposing (..)

import Types exposing (..)


init : ( Model, Cmd Msg )
init =
    { releases = [ "54.0", "54.0.1", "55.0" ]
    , current_release = Nothing
    , release_status = Nothing
    , manual_version = ""
    }
        ! []
