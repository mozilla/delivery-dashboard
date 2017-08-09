module Types exposing (..)

import Http


type alias Version =
    String


type Status
    = Missing
    | Incomplete
    | Exists
    | Error String


type alias ReleaseStatus =
    { archives : Status
    , releaseNotes : Status
    , securityAdvisories : Status
    , downloadLinks : Status
    , productDetails : Status
    }


type alias Model =
    { releases : List Version
    , current_release : Maybe Version
    , manual_version : String
    , release_status : Maybe ReleaseStatus
    }


type Msg
    = Select Version
    | ManualVersion String
    | DismissVersion
    | ReleaseStatusFetched (Result Http.Error ReleaseStatus)
