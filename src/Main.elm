module Main exposing (..)

import Html exposing (program)
import Init exposing (init)
import Types exposing (..)
import Update exposing (update)
import View exposing (view)


main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }
