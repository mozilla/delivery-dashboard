module Types exposing (..)

import Http


type alias Link =
    String


type alias Version =
    String


type Status
    = Missing
    | Incomplete
    | Exists
    | Error String


type Checks
    = Archive
    | ReleaseNotes
    | SecurityAdvisories
    | DownloadLinks
    | ProductDetails


type alias ReleaseStatus =
    { status : Status
    , message : Maybe String
    }


type alias LatestChannelVersions =
    { esr : String
    , release : String
    , beta : String
    , nightly : String
    }


type alias Model =
    { latest_channel_versions : Maybe LatestChannelVersions
    , current_release : Maybe Version
    , manual_version : String
    , archive : Maybe ReleaseStatus
    , release_notes : Maybe ReleaseStatus
    , security_advisories : Maybe ReleaseStatus
    , download_links : Maybe ReleaseStatus
    , product_details : Maybe ReleaseStatus
    }


type Msg
    = Select Version
    | ManualVersion String
    | DismissVersion
    | ReleaseStatusFetched Checks (Result Http.Error ReleaseStatus)
    | LatestChannelVersionsFetched (Result Http.Error LatestChannelVersions)
