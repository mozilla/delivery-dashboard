module Update exposing (update)

import Http
import HttpBuilder exposing (..)
import Decoder exposing (releaseStatusDecoder)
import Time
import Types exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Select version ->
            { model
                | current_release = Just version
                , manual_version = version
                , release_status = Nothing
            }
                ! [ getReleaseStatus version ]

        ManualVersion version ->
            { model | manual_version = version } ! []

        DismissVersion ->
            { model
                | manual_version = ""
                , current_release = Nothing
                , release_status = Nothing
            }
                ! []

        ReleaseStatusFetched (Ok release_status) ->
            { model | release_status = Just release_status } ! []

        ReleaseStatusFetched (Err error) ->
            let
                _ =
                    Debug.log "Error" error
            in
                model ! []


getReleaseStatus : Version -> Cmd Msg
getReleaseStatus version =
    HttpBuilder.get ("https://pollbot.dev.mozaws.net/v1/firefox/" ++ version ++ "/")
        |> withTimeout (10 * Time.second)
        |> withExpect (Http.expectJson releaseStatusDecoder)
        |> send ReleaseStatusFetched
