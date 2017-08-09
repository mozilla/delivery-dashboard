module Types exposing (..)


type alias Version =
    String


type alias Model =
    { releases : List Version
    , current_release : Maybe Version
    , manual_version : String
    }


type Msg
    = Select Version
    | ManualVersion String
    | DismissVersion
