module Update exposing (update)

import Types exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Select version ->
            { model
                | current_release = Just version
                , manual_version = version
            }
                ! []

        ManualVersion version ->
            { model | manual_version = version } ! []

        DismissVersion ->
            { model
                | manual_version = ""
                , current_release = Nothing
            }
                ! []
