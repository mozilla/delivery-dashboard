module Init exposing (..)

import Decoder exposing (..)
import Types exposing (..)
import Http
import HttpBuilder exposing (..)
import Time


init : ( Model, Cmd Msg )
init =
    { latest_channel_versions = Nothing
    , current_release = Nothing
    , archive = Nothing
    , release_notes = Nothing
    , security_advisories = Nothing
    , download_links = Nothing
    , product_details = Nothing
    , manual_version = ""
    }
        ! [ getLatestChannelVersions ]


getLatestChannelVersions : Cmd Msg
getLatestChannelVersions =
    HttpBuilder.get ("https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions")
        |> withTimeout (10 * Time.second)
        |> withExpect (Http.expectJson latestChannelVersionsDecoder)
        |> send LatestChannelVersionsFetched
