module Update exposing (update)

import Http
import HttpBuilder exposing (..)
import Decoder exposing (releaseStatusDecoder, ongoingVersionsDecoder)
import Time
import Types exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Select version ->
            { model
                | current_release = Just version
                , manual_version = version
                , archive = Nothing
                , release_notes = Nothing
                , security_advisories = Nothing
                , download_links = Nothing
                , product_details = Nothing
            }
                ! refreshStatus version

        ManualVersion version ->
            { model | manual_version = version } ! []

        DismissVersion ->
            { model
                | manual_version = ""
                , current_release = Nothing
                , archive = Nothing
                , release_notes = Nothing
                , security_advisories = Nothing
                , download_links = Nothing
                , product_details = Nothing
            }
                ! []

        ReleaseStatusFetched checks (Ok release_status) ->
            case checks of
                Archive ->
                    { model | archive = Just release_status } ! []

                ReleaseNotes ->
                    { model | release_notes = Just release_status } ! []

                SecurityAdvisories ->
                    { model | security_advisories = Just release_status } ! []

                DownloadLinks ->
                    { model | download_links = Just release_status } ! []

                ProductDetails ->
                    { model | product_details = Just release_status } ! []

        ReleaseStatusFetched checks (Err error) ->
            let
                _ =
                    Debug.log "Error" error
            in
                model ! []

        OngoingVersionFetched (Ok ongoing_versions) ->
            { model | ongoing_versions = Just ongoing_versions } ! []

        OngoingVersionFetched (Err error) ->
            let
                _ =
                    Debug.log "Error" error
            in
                model ! []


refreshStatus : Version -> List (Cmd Msg)
refreshStatus version =
    [ getReleaseStatus Archive version
    , getReleaseStatus ReleaseNotes version
    , getReleaseStatus SecurityAdvisories version
    , getReleaseStatus DownloadLinks version
    , getReleaseStatus ProductDetails version
    ]


getChecksSuffix : Checks -> String
getChecksSuffix check =
    case check of
        Archive ->
            "archive"

        ReleaseNotes ->
            "bedrock/release-notes"

        SecurityAdvisories ->
            "bedrock/security-advisories"

        DownloadLinks ->
            "bedrock/download-links"

        ProductDetails ->
            "product-details"


getReleaseStatus : Checks -> Version -> Cmd Msg
getReleaseStatus checks version =
    let
        suffix =
            getChecksSuffix checks

        url =
            "https://pollbot.dev.mozaws.net/v1/firefox/" ++ version ++ "/" ++ suffix
    in
        HttpBuilder.get url
            |> withTimeout (10 * Time.second)
            |> withExpect (Http.expectJson releaseStatusDecoder)
            |> send (ReleaseStatusFetched checks)
